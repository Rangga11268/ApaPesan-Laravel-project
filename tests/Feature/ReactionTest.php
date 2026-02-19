<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use App\Models\MessageReaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReactionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can add a reaction to a message.
     */
    public function test_user_can_add_reaction_to_message(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $message = Message::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
        ]);

        $this->actingAs($receiver)
            ->postJson(route('reaction.store', $message), ['emoji' => '👍'])
            ->assertStatus(200)
            ->assertJsonFragment(['success' => true]);

        $this->assertDatabaseHas('message_reactions', [
            'message_id' => $message->id,
            'user_id' => $receiver->id,
            'emoji' => '👍',
        ]);
    }

    /**
     * Test that user cannot add duplicate reaction.
     */
    public function test_user_cannot_add_duplicate_reaction(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        // Add reaction first time
        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '👍',
        ]);

        // Try to add same reaction again
        $this->actingAs($user)
            ->postJson(route('reaction.store', $message), ['emoji' => '👍'])
            ->assertStatus(409);
    }

    /**
     * Test that user can remove their own reaction.
     */
    public function test_user_can_remove_own_reaction(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '❤️',
        ]);

        $this->actingAs($user)
            ->deleteJson(route('reaction.destroy', [$message, '❤️']))
            ->assertStatus(200)
            ->assertJsonFragment(['success' => true]);

        $this->assertDatabaseMissing('message_reactions', [
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '❤️',
        ]);
    }

    /**
     * Test that user cannot remove non-existent reaction.
     */
    public function test_user_cannot_remove_nonexistent_reaction(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        $this->actingAs($user)
            ->deleteJson(route('reaction.destroy', [$message, '😂']))
            ->assertStatus(404);
    }

    /**
     * Test that multiple users can react to same group message.
     */
    public function test_multiple_users_can_react_to_same_message(): void
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

        // Member 1 reacts
        $this->actingAs($member1)
            ->postJson(route('reaction.store', $message), ['emoji' => '👍'])
            ->assertStatus(200);

        // Member 2 reacts with same emoji
        $this->actingAs($member2)
            ->postJson(route('reaction.store', $message), ['emoji' => '👍'])
            ->assertStatus(200);

        $this->assertEquals(2, MessageReaction::where('message_id', $message->id)->count());
    }

    /**
     * Test that user can add different reactions to same message.
     */
    public function test_user_can_add_different_reactions_to_same_message(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        $this->actingAs($user)
            ->postJson(route('reaction.store', $message), ['emoji' => '👍'])
            ->assertStatus(200);

        $this->actingAs($user)
            ->postJson(route('reaction.store', $message), ['emoji' => '❤️'])
            ->assertStatus(200);

        $this->assertEquals(
            2,
            MessageReaction::where('message_id', $message->id)
                ->where('user_id', $user->id)
                ->count()
        );
    }

    /**
     * Test reaction validation - emoji required.
     */
    public function test_reaction_requires_emoji(): void
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['receiver_id' => $user->id]);

        $this->actingAs($user)
            ->postJson(route('reaction.store', $message), [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['emoji']);
    }
}
