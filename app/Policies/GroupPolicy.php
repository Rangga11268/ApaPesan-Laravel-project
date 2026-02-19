<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;

class GroupPolicy
{
    /**
     * Determine if the user can view a group.
     */
    public function view(User $user, Group $group): bool
    {
        // User can view group only if they are a member
        return $group->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the user can update a group.
     */
    public function update(User $user, Group $group): bool
    {
        // Only owner can update group
        return $group->owner_id === $user->id;
    }

    /**
     * Determine if the user can delete a group.
     */
    public function delete(User $user, Group $group): bool
    {
        // Only owner can delete group
        return $group->owner_id === $user->id;
    }

    /**
     * Determine if the user can add members to a group.
     */
    public function addMember(User $user, Group $group): bool
    {
        // Only owner or admin can add members
        return $group->owner_id === $user->id || $user->is_admin;
    }

    /**
     * Determine if the user can remove a member from a group.
     */
    public function removeMember(User $user, Group $group, User $memberToRemove): bool
    {
        // Owner can remove anyone
        if ($group->owner_id === $user->id) {
            return true;
        }

        // Members can only remove themselves
        if ($user->id === $memberToRemove->id && $group->owner_id !== $memberToRemove->id) {
            return true;
        }

        // Admin can remove anyone except owner
        if ($user->is_admin && $memberToRemove->id !== $group->owner_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can view available users for the group.
     */
    public function viewAvailableUsers(User $user, Group $group): bool
    {
        // Only members of the group can see available users to add
        return $group->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the user can search messages in this group.
     */
    public function searchMessages(User $user, Group $group): bool
    {
        // User must be a member of the group to search messages in it
        return $this->view($user, $group);
    }
}
