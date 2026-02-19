<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that user can search in their own private messages
     */
    public function test_user_can_search_own_private_messages(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create messages
        Message::factory()
            ->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'message' => 'Hello world',
            ]);

        Message::factory()
            ->create([
                'sender_id' => $user2->id,
                'receiver_id' => $user1->id,
                'message' => 'Goodbye',
            ]);

        // User1 can search their own messages
        $this->actingAs($user1)
            ->getJson(route('message.search') . '?query=hello&user_id=' . $user2->id)
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Hello world']);
    }

    /**
     * Test that searching returns only messages the user has access to.
     * When user3 searches with user_id=user1, they only see their own
     * conversation with user1, not user1's conversation with others.
     */
    public function test_search_only_returns_accessible_messages(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // Create message between user1 and user2
        Message::factory()
            ->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'message' => 'Secret message between 1 and 2',
            ]);

        // User3 searches for "secret" in their conversation with user1
        // Should return 200 but with no results (they have no messages with user1)
        $response = $this->actingAs($user3)
            ->getJson(route('message.search') . '?query=secret&user_id=' . $user1->id)
            ->assertStatus(200);

        // Should return empty results - user3 cannot see messages between user1 and user2
        $this->assertEquals(0, $response->json('pagination.total'));
    }

    /**
     * Test that non-member cannot search group messages
     */
    public function test_non_member_cannot_search_group_messages(): void
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
                'message' => 'Group secret',
            ]);

        // Non-member cannot search group messages
        $this->actingAs($nonMember)
            ->getJson(route('message.search') . '?query=secret&group_id=' . $group->id)
            ->assertStatus(403);
    }

    /**
     * Test that member can search group messages
     */
    public function test_member_can_search_group_messages(): void
    {
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Create messages in group
        Message::factory()
            ->create([
                'group_id' => $group->id,
                'sender_id' => $member->id,
                'message' => 'Hello from group',
            ]);

        // Member can search group messages
        $this->actingAs($member)
            ->getJson(route('message.search') . '?query=hello&group_id=' . $group->id)
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Hello from group']);
    }

    /**
     * Test that user can search across all accessible messages
     */
    public function test_user_can_search_all_accessible_messages(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // Private message
        Message::factory()
            ->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'message' => 'Private search test',
            ]);

        // Group message
        $group = Group::factory()->create(['owner_id' => $user1->id]);
        $group->users()->attach([$user1->id, $user3->id]);

        Message::factory()
            ->create([
                'group_id' => $group->id,
                'sender_id' => $user3->id,
                'message' => 'Group search test',
            ]);

        // Search all messages (no specific conversation)
        $response = $this->actingAs($user1)
            ->getJson(route('message.search') . '?query=search')
            ->assertStatus(200);

        // Should find both messages
        $data = $response->json('data');
        $this->assertCount(2, $data);
    }
}
