<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use App\Models\StarredMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StarredMessageTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can star a message.
     */
    public function test_user_can_star_message(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        $this->actingAs($user)
            ->postJson(route('starred.store', $message))
            ->assertStatus(200)
            ->assertJsonFragment(['success' => true]);

        $this->assertDatabaseHas('starred_messages', [
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test that user cannot star same message twice.
     */
    public function test_user_cannot_star_same_message_twice(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        // Star first time
        StarredMessage::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);

        // Try to star again
        $this->actingAs($user)
            ->postJson(route('starred.store', $message))
            ->assertStatus(409);
    }

    /**
     * Test that user can unstar a message.
     */
    public function test_user_can_unstar_message(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        StarredMessage::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->deleteJson(route('starred.destroy', $message))
            ->assertStatus(200)
            ->assertJsonFragment(['success' => true]);

        $this->assertDatabaseMissing('starred_messages', [
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test that user cannot unstar non-starred message.
     */
    public function test_user_cannot_unstar_non_starred_message(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        $this->actingAs($user)
            ->deleteJson(route('starred.destroy', $message))
            ->assertStatus(404);
    }

    /**
     * Test that user can list their starred messages.
     */
    public function test_user_can_list_starred_messages(): void
    {
        $user = User::factory()->create();
        $messages = Message::factory(3)->create(['receiver_id' => $user->id]);

        // Star all messages
        foreach ($messages as $message) {
            StarredMessage::create([
                'message_id' => $message->id,
                'user_id' => $user->id,
            ]);
        }

        $response = $this->actingAs($user)
            ->getJson(route('starred.index'))
            ->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'pagination' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertEquals(3, $response->json('pagination.total'));
    }

    /**
     * Test that starred messages are user-specific.
     */
    public function test_starred_messages_are_user_specific(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $message = Message::factory()->create();

        // User 1 stars the message
        StarredMessage::create([
            'message_id' => $message->id,
            'user_id' => $user1->id,
        ]);

        // User 2 should see no starred messages
        $response = $this->actingAs($user2)
            ->getJson(route('starred.index'))
            ->assertStatus(200);

        $this->assertEquals(0, $response->json('pagination.total'));
    }

    /**
     * Test that group members can star same message independently.
     */
    public function test_users_can_star_same_message_independently(): void
    {
        $owner = User::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member1->id, $member2->id]);

        $message = Message::factory()->create([
            'sender_id' => $owner->id,
            'group_id' => $group->id,
            'receiver_id' => null,
        ]);

        // Both members star the same message
        $this->actingAs($member1)
            ->postJson(route('starred.store', $message))
            ->assertStatus(200);

        $this->actingAs($member2)
            ->postJson(route('starred.store', $message))
            ->assertStatus(200);

        $this->assertEquals(2, StarredMessage::where('message_id', $message->id)->count());
    }
}
