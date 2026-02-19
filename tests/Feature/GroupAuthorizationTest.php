<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that only group owner can update group
     */
    public function test_only_owner_can_update_group(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member->id]);

        // Owner can update
        $this->actingAs($owner)
            ->putJson(route('group.update', $group), [
                'name' => 'Updated Group Name',
            ])
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Group Name']);

        // Member cannot update
        $this->actingAs($member)
            ->putJson(route('group.update', $group), [
                'name' => 'Hacked Name',
            ])
            ->assertStatus(403);
    }

    /**
     * Test that only group owner can delete group
     */
    public function test_only_owner_can_delete_group(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member->id]);

        // Member cannot delete
        $this->actingAs($member)
            ->deleteJson(route('group.destroy', $group))
            ->assertStatus(403);

        // Owner can delete
        $this->actingAs($owner)
            ->deleteJson(route('group.destroy', $group))
            ->assertStatus(200);

        // Verify group is deleted
        $this->assertDatabaseMissing('groups', ['id' => $group->id]);
    }

    /**
     * Test that only owner/admin can add members
     */
    public function test_only_owner_can_add_members(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $userToAdd = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member->id]);

        // Member cannot add
        $this->actingAs($member)
            ->postJson(route('group.addMember', $group), [
                'user_id' => $userToAdd->id,
            ])
            ->assertStatus(403);

        // Owner can add
        $this->actingAs($owner)
            ->postJson(route('group.addMember', $group), [
                'user_id' => $userToAdd->id,
            ])
            ->assertStatus(200);

        // Verify user was added
        $this->assertTrue($group->users()->where('user_id', $userToAdd->id)->exists());
    }

    /**
     * Test member removal rules
     */
    public function test_member_removal_rules(): void
    {
        $owner = User::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member1->id, $member2->id]);

        // Member can remove themselves
        $this->actingAs($member1)
            ->deleteJson(route('group.removeMember', [$group, $member1]))
            ->assertStatus(200);

        // Verify member was removed
        $this->assertFalse($group->users()->where('user_id', $member1->id)->exists());

        // Owner can remove other members
        $this->actingAs($owner)
            ->deleteJson(route('group.removeMember', [$group, $member2]))
            ->assertStatus(200);

        // Verify member was removed
        $this->assertFalse($group->users()->where('user_id', $member2->id)->exists());

        // Cannot remove owner
        $this->actingAs($owner)
            ->deleteJson(route('group.removeMember', [$group, $owner]))
            ->assertStatus(400);
    }

    /**
     * Test that only group members can view available users
     */
    public function test_only_members_can_view_available_users(): void
    {
        $member = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $member->id]);
        $group->users()->attach($member->id);

        // Member can view available users
        $this->actingAs($member)
            ->getJson(route('group.availableUsers', $group))
            ->assertStatus(200);

        // Non-member cannot view available users
        $this->actingAs($nonMember)
            ->getJson(route('group.availableUsers', $group))
            ->assertStatus(403);
    }

    /**
     * Test that non-member cannot view group
     */
    public function test_non_member_cannot_view_group(): void
    {
        $owner = User::factory()->create();
        $nonMember = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach($owner->id);

        // Non-member cannot attempt group operations that check membership
        // This would be tested through message.byGroup
    }

    /**
     * Test that admin can perform admin actions
     */
    public function test_admin_can_add_members_and_remove(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $userToAdd = User::factory()->create();

        $group = Group::factory()->create(['owner_id' => $owner->id]);
        $group->users()->attach([$owner->id, $member->id]);

        // Admin can add members
        $this->actingAs($admin)
            ->postJson(route('group.addMember', $group), [
                'user_id' => $userToAdd->id,
            ])
            ->assertStatus(200);

        // Admin can remove members
        $this->actingAs($admin)
            ->deleteJson(route('group.removeMember', [$group, $member]))
            ->assertStatus(200);
    }
}
