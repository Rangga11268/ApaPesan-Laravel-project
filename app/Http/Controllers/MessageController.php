<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\MessageResource;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{

    public function byUser(User $user)
    {
        $authUser = Auth::user();

        // Can't chat with yourself
        if ($authUser->id === $user->id) {
            abort(400, 'Cannot view conversation with yourself');
        }

        // Check if user is blocked (unless admin)
        if ($user->blocked_at && !$authUser->is_admin) {
            abort(403, 'This user is not available');
        }

        $authUserId = Auth::id();
        $messages = Message::where(function ($query) use ($authUserId, $user) {
            $query->where('sender_id', $authUserId)
                ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($authUserId, $user) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $authUserId);
        })->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $user->toConversationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function byGroup(Group $group)
    {
        // Authorization: user must be a member of the group
        $this->authorize('view', $group);

        $messages = Message::where('group_id', $group->id)
            ->latest()
            ->paginate(10);

        return inertia('Home', [
            'selectedConversation' => $group->toConversationArray(),
            'messages' => MessageResource::collection($messages),
        ]);
    }

    public function loadOlder(Message $message)
    {
        // Authorization: user must be able to view this message
        $this->authorize('view', $message);

        if ($message->group_id) {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where('group_id', $message->group_id)
                ->latest()
                ->paginate(10);
        } else {
            $messages = Message::where('created_at', '<', $message->created_at)
                ->where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id);
                })
                ->orWhere(function ($query) use ($message) {
                    $query->where('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })
                ->latest()
                ->paginate(10);
        }
        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $data['sender_id'] = Auth::id();
        $receiverId  = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;

        // Authorization: if sending to group, user must be a member
        if ($groupId) {
            $group = Group::findOrFail($groupId);
            $this->authorize('view', $group);
        }

        $files = $data['attachments'] ?? [];
        $message = Message::create($data);
        $attachments = [];
        if ($files) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);

                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $file->store($directory, 'public'),
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments = $attachments;
        }

        // Parse and create mentions from message text
        if (!empty($data['message'])) {
            $mentionedUserIds = MentionController::parseMentions($data['message']);
            if (!empty($mentionedUserIds)) {
                MentionController::createMentionsForMessage($message, $mentionedUserIds);
            }
        }

        if ($receiverId) {
            Conversation::updateConversationWithMessage($receiverId, Auth::id(), $message);
        }

        if ($groupId) {
            Group::updateConversationWithMessage($groupId, $message);
        }

        SocketMessage::dispatch($message);
        return new MessageResource($message);
    }

    public function destroy(Message $message)
    {
        // Authorization: only the message sender can delete
        $this->authorize('delete', $message);

        Log::info('Delete message request received', [
            'message_id' => $message->id,
            'user_id' => Auth::id(),
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id
        ]);

        // Store the message data before deleting for response (Resolve immediately to avoid lazy loading issues after deletion)
        $message->loadMissing(['sender', 'attachments']); // Ensure relations are loaded
        $messageData = (new MessageResource($message))->resolve();

        $prevMessage = null;

        // Use transaction and temporarily disable FK checks to ensure deletion
        \Illuminate\Support\Facades\DB::transaction(function () use ($message, &$prevMessage) {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            try {
                // Find ALL groups and conversations that reference this message
                $groups = Group::where('last_message_id', $message->id)->get();
                $conversations = Conversation::where('last_message_id', $message->id)->get();

                // Update all groups that reference this message
                foreach ($groups as $group) {
                    $lastMessage = Message::where('group_id', $group->id)
                        ->where('id', '!=', $message->id)
                        ->latest()
                        ->first();

                    $group->last_message_id = $lastMessage ? $lastMessage->id : null;
                    $group->save();
                }

                // Update all conversations that reference this message
                foreach ($conversations as $conversation) {
                    $lastMessage = Message::where(function ($query) use ($conversation) {
                        $query->where('sender_id', $conversation->user_id1)
                            ->where('receiver_id', $conversation->user_id2);
                    })
                        ->orWhere(function ($query) use ($conversation) {
                            $query->where('sender_id', $conversation->user_id2)
                                ->where('receiver_id', $conversation->user_id1);
                        })
                        ->where('id', '!=', $message->id)
                        ->latest()
                        ->first();

                    $conversation->last_message_id = $lastMessage ? $lastMessage->id : null;
                    $conversation->save();
                }

                // Delete the message attachments and files
                foreach ($message->attachments as $attachment) {
                    $dir = dirname($attachment->path);
                    Storage::disk('public')->deleteDirectory($dir);
                }
                $message->attachments()->delete();

                // Dispatch event for real-time deletion BEFORE deleting the message
                if ($message->group_id) {
                    $prevMessage = Message::where('group_id', $message->group_id)->where('id', '!=', $message->id)->latest()->first();
                } else {
                    $prevMessage = Message::where(function ($q) use ($message) {
                        $q->where('sender_id', $message->sender_id)->where('receiver_id', $message->receiver_id);
                    })->orWhere(function ($q) use ($message) {
                        $q->where('sender_id', $message->receiver_id)->where('receiver_id', $message->sender_id);
                    })->where('id', '!=', $message->id)->latest()->first();
                }

                if ($prevMessage) {
                    $prevMessage->loadMissing(['sender', 'attachments']);
                }

                try {
                    \App\Events\SocketMessageDeleted::dispatch($message, $prevMessage);
                } catch (\Throwable $e) {
                    Log::error('Failed to broadcast message deletion: ' . $e->getMessage());
                }

                $message->delete();
            } finally {
                // ALWAYS re-enable foreign keys
                \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            }
        });

        return response()->json([
            'message' => $messageData,
            'prevMessage' => $prevMessage ? (new MessageResource($prevMessage))->resolve() : null
        ]);
    }

    /**
     * Update (edit) a message.
     */
    public function update(Request $request, Message $message)
    {
        // Authorization: only the sender can edit their own messages
        $this->authorize('update', $message);

        $request->validate([
            'message' => 'required|string',
        ]);

        $message->update([
            'message' => $request->message,
            'edited_at' => now(),
        ]);

        $message->loadMissing(['sender', 'attachments', 'replyTo']);

        // Broadcast the edit
        \App\Events\MessageEdited::dispatch($message);

        return new MessageResource($message);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'exists:messages,id',
        ]);

        $user = Auth::user();
        $messageIds = $request->message_ids;

        // Get messages that are not from the current user and not already read
        $messages = Message::whereIn('id', $messageIds)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->get();

        if ($messages->isEmpty()) {
            return response()->json(['success' => true, 'updated' => 0]);
        }

        // Update all messages
        Message::whereIn('id', $messages->pluck('id'))
            ->update(['read_at' => now()]);

        // Get sender info for broadcasting
        $firstMessage = $messages->first();
        $senderId = $firstMessage->sender_id;
        $groupId = $firstMessage->group_id;

        // Broadcast read receipt
        \App\Events\MessageRead::dispatch(
            $messages->pluck('id')->toArray(),
            $user,
            $senderId,
            $groupId
        );

        return response()->json([
            'success' => true,
            'updated' => $messages->count(),
        ]);
    }

    /**
     * Search messages.
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'user_id' => 'nullable|exists:users,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = $request->query('query');

        $messagesQuery = Message::where('message', 'like', "%{$query}%")
            ->with(['sender', 'receiver', 'group']);

        // Filter by specific conversation if provided
        if ($request->user_id) {
            $targetUser = User::findOrFail($request->user_id);

            // User can search their own conversation with another user
            // The actual query below already filters to only show messages where user is sender/receiver
            $messagesQuery->where(function ($q) use ($user, $request) {
                $q->where(function ($inner) use ($user, $request) {
                    $inner->where('sender_id', $user->id)
                        ->where('receiver_id', $request->user_id);
                })->orWhere(function ($inner) use ($user, $request) {
                    $inner->where('sender_id', $request->user_id)
                        ->where('receiver_id', $user->id);
                });
            });
        } elseif ($request->group_id) {
            // Verify user is member of group using policy
            $group = Group::findOrFail($request->group_id);
            $this->authorize('searchMessages', $group);
            $messagesQuery->where('group_id', $request->group_id);
        } else {
            // Search all accessible messages
            $userGroupIds = $user->groups()->pluck('groups.id');

            $messagesQuery->where(function ($q) use ($user, $userGroupIds) {
                $q->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id)
                    ->orWhereIn('group_id', $userGroupIds);
            });
        }

        $messages = $messagesQuery->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }
}
