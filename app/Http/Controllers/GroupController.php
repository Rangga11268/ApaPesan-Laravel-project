<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /**
     * Store a newly created group.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $user = Auth::user();

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => $user->id,
        ]);

        // Add owner to group
        $group->users()->attach($user->id);

        // Add other members
        $group->users()->attach($request->user_ids);

        $group->load('users');

        return response()->json([
            'success' => true,
            'group' => $group->toConversationArray(),
        ]);
    }

    /**
     * Update the specified group.
     */
    public function update(Request $request, Group $group)
    {
        // Authorization via policy: only owner can update
        $this->authorize('update', $group);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group->update($request->only(['name', 'description']));

        return response()->json([
            'success' => true,
            'group' => $group->fresh()->toConversationArray(),
        ]);
    }

    /**
     * Remove the specified group.
     */
    public function destroy(Group $group)
    {
        // Authorization via policy: only owner can delete
        $this->authorize('delete', $group);

        $group->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Add a member to the group.
     */
    public function addMember(Request $request, Group $group)
    {
        // Authorization via policy: only owner or admin can add members
        $this->authorize('addMember', $group);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Check if already a member
        if ($group->users()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['message' => 'User is already a member'], 409);
        }

        $group->users()->attach($request->user_id);

        return response()->json([
            'success' => true,
            'group' => $group->fresh()->load('users')->toConversationArray(),
        ]);
    }

    /**
     * Remove a member from the group.
     */
    public function removeMember(Group $group, User $user)
    {
        $authUser = Auth::user();

        // Authorization via policy
        $this->authorize('removeMember', [$group, $user]);

        // Owner cannot be removed (must delete group instead)
        if ($user->id === $group->owner_id) {
            return response()->json(['message' => 'Cannot remove the group owner'], 400);
        }

        $group->users()->detach($user->id);

        return response()->json([
            'success' => true,
            'group' => $group->fresh()->load('users')->toConversationArray(),
        ]);
    }

    /**
     * Get available users to add to group.
     */
    public function availableUsers(Group $group)
    {
        // Authorization: only members of the group can view available users
        $this->authorize('viewAvailableUsers', $group);

        $existingUserIds = $group->users()->pluck('users.id');

        $users = User::whereNotIn('id', $existingUserIds)
            ->whereNull('blocked_at')
            ->select('id', 'name', 'email', 'avatar')
            ->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }
}
