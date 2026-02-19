<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MessageMention;
use App\Models\User;
use App\Http\Resources\MessageResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MentionController extends Controller
{
    /**
     * Get all mentions for the current user.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $mentions = MessageMention::where('user_id', $user->id)
            ->with(['message.sender', 'message.group', 'message.attachments', 'mentionedBy'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $mentions->map(function ($mention) {
                return [
                    'id' => $mention->id,
                    'message' => new MessageResource($mention->message),
                    'mentioned_by' => [
                        'id' => $mention->mentionedBy->id,
                        'name' => $mention->mentionedBy->name,
                        'avatar_url' => $mention->mentionedBy->avatar_url,
                    ],
                    'is_read' => $mention->is_read,
                    'read_at' => $mention->read_at?->toISOString(),
                    'created_at' => $mention->created_at->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $mentions->currentPage(),
                'last_page' => $mentions->lastPage(),
                'per_page' => $mentions->perPage(),
                'total' => $mentions->total(),
            ],
        ]);
    }

    /**
     * Get unread mentions count.
     */
    public function unreadCount()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $count = MessageMention::getUnreadCountForUser($user->id);

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    /**
     * Mark specific mentions as read.
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'mention_ids' => 'required|array',
            'mention_ids.*' => 'exists:message_mentions,id',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $updated = MessageMention::whereIn('id', $request->mention_ids)
            ->where('user_id', $user->id) // Only update own mentions
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'updated' => $updated,
        ]);
    }

    /**
     * Mark all mentions as read.
     */
    public function markAllAsRead()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $updated = MessageMention::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'updated' => $updated,
        ]);
    }

    /**
     * Search for users to mention (autocomplete).
     */
    public function searchUsers(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = $request->query('query');

        $usersQuery = User::where('id', '!=', $user->id)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->whereNull('blocked_at');

        // If group_id is provided, only show group members
        if ($request->group_id) {
            $usersQuery->whereHas('groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        $users = $usersQuery->limit(10)->get(['id', 'name', 'email', 'avatar']);

        return response()->json([
            'success' => true,
            'data' => $users->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar_url' => $u->avatar_url,
                ];
            }),
        ]);
    }

    /**
     * Parse message text and extract mentions.
     * Returns array of user IDs mentioned.
     */
    public static function parseMentions(string $text): array
    {
        // Match @username or @{user_id}
        preg_match_all('/@\{(\d+)\}/', $text, $matches);

        return array_map('intval', array_unique($matches[1] ?? []));
    }

    /**
     * Create mentions for a message.
     */
    public static function createMentionsForMessage(Message $message, array $userIds): void
    {
        $senderId = $message->sender_id;

        foreach ($userIds as $userId) {
            // Don't create mention if user mentioned themselves
            if ($userId === $senderId) {
                continue;
            }

            // Verify user exists
            if (!User::find($userId)) {
                continue;
            }

            MessageMention::create([
                'message_id' => $message->id,
                'user_id' => $userId,
                'mentioned_by' => $senderId,
            ]);
        }
    }
}
