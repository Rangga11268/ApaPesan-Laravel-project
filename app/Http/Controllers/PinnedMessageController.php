<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Group;
use App\Http\Resources\MessageResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PinnedMessageController extends Controller
{
    /**
     * Get all pinned messages in a group.
     */
    public function index(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $group = Group::findOrFail($request->group_id);

        // Verify user is member of group
        $this->authorize('view', $group);

        $pinned = Message::where('group_id', $group->id)
            ->whereNotNull('pinned_at')
            ->with(['sender', 'attachments'])
            ->orderBy('pinned_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($pinned),
        ]);
    }

    /**
     * Pin a message in a group.
     */
    public function store(Message $message)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Only allow pinning group messages
        if (!$message->group_id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group messages can be pinned.',
            ], 400);
        }

        $group = $message->group;

        // Verify user is member/admin of group
        $this->authorize('view', $group);

        // Check if user is admin or owner of the group
        if (!$user->is_admin && $group->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group admins can pin messages.',
            ], 403);
        }

        // Check if message is already pinned
        if ($message->isPinned()) {
            return response()->json([
                'success' => false,
                'message' => 'Message is already pinned.',
            ], 400);
        }

        // Limit pinned messages per group (max 25)
        $pinnedCount = Message::where('group_id', $group->id)
            ->whereNotNull('pinned_at')
            ->count();

        if ($pinnedCount >= 25) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum pinned messages (25) reached. Unpin a message first.',
            ], 400);
        }

        $message->update(['pinned_at' => now()]);
        $message->loadMissing(['sender', 'attachments']);

        return response()->json([
            'success' => true,
            'message' => 'Message pinned successfully.',
            'data' => new MessageResource($message),
        ]);
    }

    /**
     * Unpin a message.
     */
    public function destroy(Message $message)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Only allow unpinning group messages
        if (!$message->group_id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group messages can be unpinned.',
            ], 400);
        }

        $group = $message->group;

        // Verify user is member/admin of group
        $this->authorize('view', $group);

        // Check if user is admin or owner of the group
        if (!$user->is_admin && $group->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only group admins can unpin messages.',
            ], 403);
        }

        // Check if message is pinned
        if (!$message->isPinned()) {
            return response()->json([
                'success' => false,
                'message' => 'Message is not pinned.',
            ], 400);
        }

        $message->update(['pinned_at' => null]);
        $message->loadMissing(['sender', 'attachments']);

        return response()->json([
            'success' => true,
            'message' => 'Message unpinned successfully.',
            'data' => new MessageResource($message),
        ]);
    }
}
