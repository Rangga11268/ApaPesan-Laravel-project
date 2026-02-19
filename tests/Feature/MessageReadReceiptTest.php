<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageReadReceiptTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that users can mark messages as read
     */
    public function test_user_can_mark_messages_as_read(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        // Create unread message
        $message = Message::factory()
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'read_at' => null,
            ]);

        // Receiver marks as read
        $this->actingAs($receiver)
            ->postJson(route('message.read'), [
                'message_ids' => [$message->id],
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['updated' => 1]);

        // Verify message is marked as read
        $this->assertNotNull($message->fresh()->read_at);
    }

    /**
     * Test that sender cannot mark their own message as read
     */
    public function test_sender_cannot_mark_own_message_as_read(): void
    {
        $sender = User::factory()->create();

        // Create message from sender
        $message = Message::factory()
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => User::factory()->create()->id,
                'read_at' => null,
            ]);

        // Sender tries to mark own message as read
        $this->actingAs($sender)
            ->postJson(route('message.read'), [
                'message_ids' => [$message->id],
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['updated' => 0]);

        // Verify message is still unread
        $this->assertNull($message->fresh()->read_at);
    }

    /**
     * Test marking multiple messages as read
     */
    public function test_marking_multiple_messages_as_read(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        // Create multiple unread messages
        $messages = Message::factory(3)
            ->create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'read_at' => null,
            ]);

        $messageIds = $messages->pluck('id')->toArray();

        // Mark all as read
        $this->actingAs($receiver)
            ->postJson(route('message.read'), [
                'message_ids' => $messageIds,
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['updated' => 3]);

        // Verify all messages are marked as read
        foreach ($messages as $message) {
            $this->assertNotNull($message->fresh()->read_at);
        }
    }

    /**
     * Test group message read receipts
     */
    public function test_group_message_read_receipts(): void
    {
        $sender = User::factory()->create();
        $reader = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $sender->id]);
        $group->users()->attach([$sender->id, $reader->id]);

        // Create unread group message
        $message = Message::factory()
            ->create([
                'group_id' => $group->id,
                'sender_id' => $sender->id,
                'read_at' => null,
            ]);

        // Reader marks as read
        $this->actingAs($reader)
            ->postJson(route('message.read'), [
                'message_ids' => [$message->id],
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['updated' => 1]);

        // Verify message is marked as read
        $this->assertNotNull($message->fresh()->read_at);
    }
}
