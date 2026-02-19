<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can export private chat as JSON.
     */
    public function test_user_can_export_private_chat_as_json(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Hello there',
        ]);

        $response = $this->actingAs($user1)
            ->get(route('chat.export', ['type' => 'user', 'id' => $user2->id]) . '?format=json')
            ->assertStatus(200)
            ->assertJsonStructure([
                'chat_name',
                'exported_at',
                'message_count',
                'messages',
            ]);

        $this->assertEquals(1, $response->json('message_count'));
    }

    /**
     * Test that user can export private chat as TXT.
     */
    public function test_user_can_export_private_chat_as_txt(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create(['name' => 'John Doe']);

        Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Hello there',
        ]);

        $response = $this->actingAs($user1)
            ->get(route('chat.export', ['type' => 'user', 'id' => $user2->id]) . '?format=txt')
            ->assertStatus(200);

        $this->assertStringContainsString('Chat Export: John Doe', $response->getContent());
    }

    /**
     * Test that group member can export group chat.
     */
    public function test_group_member_can_export_group_chat(): void
    {
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id, 'name' => 'Test Group']);
        $group->users()->attach($member->id);

        Message::factory()->create([
            'group_id' => $group->id,
            'sender_id' => $member->id,
            'message' => 'Group message',
        ]);

        $response = $this->actingAs($member)
            ->get(route('chat.export', ['type' => 'group', 'id' => $group->id]) . '?format=json')
            ->assertStatus(200);

        $this->assertEquals('Test Group', $response->json('chat_name'));
        $this->assertEquals(1, $response->json('message_count'));
    }

    /**
     * Test that non-member cannot export group chat.
     */
    public function test_non_member_cannot_export_group_chat(): void
    {
        $owner = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach($owner->id);

        Message::factory()->create([
            'group_id' => $group->id,
            'sender_id' => $owner->id,
        ]);

        $this->actingAs($nonMember)
            ->get(route('chat.export', ['type' => 'group', 'id' => $group->id]))
            ->assertStatus(403);
    }

    /**
     * Test that export with invalid type returns 400.
     */
    public function test_export_with_invalid_type_returns_400(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('chat.export', ['type' => 'invalid', 'id' => 1]))
            ->assertStatus(400);
    }

    /**
     * Test that export includes message attachments.
     */
    public function test_export_includes_message_attachments(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $message = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
        ]);

        // Manually add attachment
        $message->attachments()->create([
            'name' => 'document.pdf',
            'mime' => 'application/pdf',
            'size' => 1024,
            'path' => 'attachments/test/document.pdf',
        ]);

        $response = $this->actingAs($user1)
            ->get(route('chat.export', ['type' => 'user', 'id' => $user2->id]) . '?format=json')
            ->assertStatus(200);

        $messages = $response->json('messages');
        $this->assertNotEmpty($messages[0]['attachments']);
    }

    /**
     * Test that export only includes messages from the specified conversation.
     */
    public function test_export_only_includes_conversation_messages(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // Messages between user1 and user2
        Message::factory(3)->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
        ]);

        // Messages between user1 and user3 (should NOT be in export)
        Message::factory(2)->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user3->id,
        ]);

        $response = $this->actingAs($user1)
            ->get(route('chat.export', ['type' => 'user', 'id' => $user2->id]) . '?format=json')
            ->assertStatus(200);

        $this->assertEquals(3, $response->json('message_count'));
    }
}
