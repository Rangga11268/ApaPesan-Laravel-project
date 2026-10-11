<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealTimeResilienceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test idempotency: sending identical client_id does not duplicate message in database.
     */
    public function test_message_creation_is_idempotent_with_client_id(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $clientId = (string) Str::uuid();

        $payload = [
            'message' => 'Hello, this is an idempotent test',
            'receiver_id' => $receiver->id,
            'client_id' => $clientId,
        ];

        // First submission creates message (201 Created)
        $response1 = $this->actingAs($sender)->postJson(route('message.store'), $payload);
        $response1->assertSuccessful();

        $this->assertDatabaseHas('messages', [
            'client_id' => $clientId,
            'message' => 'Hello, this is an idempotent test',
        ]);
        $this->assertEquals(1, Message::where('client_id', $clientId)->count());

        // Duplicate submission with same client_id (e.g. network retry or timeout)
        $response2 = $this->actingAs($sender)->postJson(route('message.store'), $payload);
        $response2->assertSuccessful();

        // Database still has exactly 1 row
        $this->assertEquals(1, Message::where('client_id', $clientId)->count());
        $this->assertEquals($response1->json('id'), $response2->json('id'));
    }

    /**
     * Test monotonic ID pagination: loadOlder uses id < given_message_id.
     */
    public function test_load_older_messages_uses_monotonic_id_cursor(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $msg1 = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'First message',
        ]);

        $msg2 = Message::factory()->create([
            'sender_id' => $user2->id,
            'receiver_id' => $user1->id,
            'message' => 'Second message',
        ]);

        $msg3 = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Third message',
        ]);

        $response = $this->actingAs($user1)->getJson(route('message.loadOlder', $msg3->id));
        $response->assertStatus(200);

        $returnedIds = collect($response->json('data'))->pluck('id')->all();

        // Must include msg2 and msg1, but NOT msg3
        $this->assertContains($msg1->id, $returnedIds);
        $this->assertContains($msg2->id, $returnedIds);
        $this->assertNotContains($msg3->id, $returnedIds);
    }

    /**
     * Test catch-up sync: retrieves messages with id > since_id.
     */
    public function test_sync_retrieves_missed_messages_after_reconnection(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $msg1 = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Message 1',
        ]);

        $msg2 = Message::factory()->create([
            'sender_id' => $user2->id,
            'receiver_id' => $user1->id,
            'message' => 'Missed Message 2',
        ]);

        $msg3 = Message::factory()->create([
            'sender_id' => $user2->id,
            'receiver_id' => $user1->id,
            'message' => 'Missed Message 3',
        ]);

        $response = $this->actingAs($user1)->getJson(route('message.sync', [
            'type' => 'user',
            'conversation_id' => $user2->id,
            'since_id' => $msg1->id,
        ]));

        $response->assertStatus(200);

        $returnedIds = collect($response->json('data'))->pluck('id')->all();
        $this->assertEquals([$msg2->id, $msg3->id], $returnedIds);
    }

    /**
     * Test catch-up sync authorization: cannot sync messages of other users' conversations.
     */
    public function test_sync_enforces_authorization_for_unauthorized_users(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $stranger = User::factory()->create();

        $response = $this->actingAs($stranger)->getJson(route('message.sync', [
            'type' => 'user',
            'conversation_id' => $user2->id,
            'since_id' => 0,
        ]));

        // Since stranger is neither sender nor receiver of user2 in this context, or testing group auth
        // When stranger accesses group they do not belong to:
        $group = Group::factory()->create();
        // Stranger is not added to group

        $groupResponse = $this->actingAs($stranger)->getJson(route('message.sync', [
            'type' => 'group',
            'conversation_id' => $group->id,
            'since_id' => 0,
        ]));

        $groupResponse->assertStatus(403);
    }
}
