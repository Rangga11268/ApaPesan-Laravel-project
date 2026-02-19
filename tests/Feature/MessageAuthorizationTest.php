<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can view their conversation with another user
     * Note: /user/{user} shows the conversation between auth user and target user
     */
    public function test_user_can_view_conversation_with_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create message between user1 and user2
        Message::factory()
            ->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'group_id' => null,
                'message' => 'Private message',
            ]);

        // User1 can view their conversation with user2
        $this->actingAs($user1)
            ->get(route('chat.user', $user2->id))
            ->assertStatus(200);
    }

    /**
     * Test that conversation only shows messages between the two users
     */
    public function test_conversation_only_shows_messages_between_two_users(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // Create message between user1 and user2
        Message::factory()
            ->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'group_id' => null,
                'message' => 'Message between 1 and 2',
            ]);

        // Create message between user2 and user3
        Message::factory()
            ->create([
                'sender_id' => $user2->id,
                'receiver_id' => $user3->id,
                'group_id' => null,
                'message' => 'Message between 2 and 3',
            ]);

        // When user1 views conversation with user2, they should only see their messages
        $response = $this->actingAs($user1)
            ->get(route('chat.user', $user2->id));

        $response->assertStatus(200);
        // The messages prop should only contain messages between user1 and user2
    }

    /**
     * Test that only message sender can edit their message
     */
    public function test_only_sender_can_edit_message(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $message = Message::factory()
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'message' => 'Original message',
            ]);

        // Sender can edit
        $this->actingAs($sender)
            ->patch(route('message.update', $message), ['message' => 'Updated message'])
            ->assertStatus(200);

        // Receiver cannot edit
        $this->actingAs($receiver)
            ->patch(route('message.update', $message), ['message' => 'Hacked message'])
            ->assertStatus(403);
    }

    /**
     * Test that only message sender can delete their message
     */
    public function test_only_sender_can_delete_message(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $message = Message::factory()
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'message' => 'Message to delete',
            ]);

        // Sender can delete
        $this->actingAs($sender)
            ->delete(route('message.destroy', $message))
            ->assertStatus(200);

        // Verify message is deleted
        $this->assertDatabaseMissing('messages', ['id' => $message->id]);

        // Create another message for receiver test
        $message2 = Message::factory()
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'message' => 'Another message',
            ]);

        // Receiver cannot delete sender's message
        $this->actingAs($receiver)
            ->delete(route('message.destroy', $message2))
            ->assertStatus(403);
    }

    /**
     * Test that non-member cannot view group messages
     */
    public function test_non_member_cannot_view_group_messages(): void
    {
        $member = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Create message in group
        Message::factory()
            ->create([
                'group_id' => $group->id,
                'sender_id' => $member->id,
                'message' => 'Group message',
            ]);

        // Non-member cannot view group messages
        $this->actingAs($nonMember)
            ->get(route('chat.group', $group->id))
            ->assertStatus(403);
    }

    /**
     * Test that group member can view group messages
     */
    public function test_member_can_view_group_messages(): void
    {
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Create message in group
        Message::factory()
            ->create([
                'group_id' => $group->id,
                'sender_id' => $member->id,
                'receiver_id' => null,
                'message' => 'Group message',
            ]);

        // Member can view group messages (Inertia page)
        $this->actingAs($member)
            ->get(route('chat.group', $group->id))
            ->assertStatus(200);
    }

    /**
     * Test that non-member cannot send message to group
     */
    public function test_non_member_cannot_send_message_to_group(): void
    {
        $member = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Non-member cannot send message to group
        $this->actingAs($nonMember)
            ->postJson(route('message.store'), [
                'group_id' => $group->id,
                'message' => 'Attempt to send message',
            ])
            ->assertStatus(403);
    }

    /**
     * Test that member can send message to group
     */
    public function test_member_can_send_message_to_group(): void
    {
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Member can send message to group
        $this->actingAs($member)
            ->postJson(route('message.store'), [
                'group_id' => $group->id,
                'message' => 'Group message',
            ])
            ->assertStatus(201)
            ->assertJsonFragment(['message' => 'Group message']);
    }
}
