<?php

namespace App\Http\Controllers;

use App\Events\SocketMessage;
use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\MessageResource;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{

    public function byUser(User $user)
    {
        $authUserId = Auth::id();
        $messages = Message::where(function($query) use ($authUserId, $user) {
            $query->where('sender_id', $authUserId)
                ->where('receiver_id', $user->id);
        })->orWhere(function($query) use ($authUserId, $user) {
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
        \Log::info('Delete message request received', [
            'message_id' => $message->id,
            'user_id' => Auth::id(),
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id
        ]);

        // Allow both sender and receiver to delete messages
        $authId = Auth::id();
        if ($message->sender_id !== $authId && $message->receiver_id !== $authId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Store the message data before deleting for response
        $messageData = new MessageResource($message);
        
        // Find ALL groups and conversations that reference this message
        $groups = Group::where('last_message_id', $message->id)->get();
        $conversations = Conversation::where('last_message_id', $message->id)->get();
        
        \Log::info('Found groups and conversations referencing message', [
            'message_id' => $message->id,
            'group_count' => $groups->count(),
            'conversation_count' => $conversations->count()
        ]);

        // Update all groups that reference this message
        foreach ($groups as $group) {
            // Find the last message for this group (excluding the one we're deleting)
            $lastMessage = Message::where('group_id', $group->id)
                ->where('id', '!=', $message->id)
                ->latest()
                ->first();
                
            \Log::info('Found last message for group', [
                'group_id' => $group->id,
                'last_message_id' => $lastMessage ? $lastMessage->id : null
            ]);
            
            // Update the group's last_message_id
            $group->last_message_id = $lastMessage ? $lastMessage->id : null;
            $group->save();
            
            \Log::info('Updated group last_message_id', [
                'group_id' => $group->id,
                'last_message_id' => $group->last_message_id
            ]);
        }

        // Update all conversations that reference this message
        foreach ($conversations as $conversation) {
            // Find the last message for this conversation (excluding the one we're deleting)
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
            
            \Log::info('Found last message for conversation', [
                'conversation_id' => $conversation->id,
                'last_message_id' => $lastMessage ? $lastMessage->id : null
            ]);
            
            // Update the conversation's last_message_id
            $conversation->last_message_id = $lastMessage ? $lastMessage->id : null;
            $conversation->save();
            
            \Log::info('Updated conversation last_message_id', [
                'conversation_id' => $conversation->id,
                'last_message_id' => $conversation->last_message_id
            ]);
        }

        // Delete the message attachments and files
        $message->attachments->each(function ($attachment) {
            $dir = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($dir);
        });
        $message->attachments()->delete();

        \Log::info('Dispatching SocketMessageDeleted event', [
            'message_id' => $message->id
        ]);

        // Dispatch event for real-time deletion BEFORE deleting the message
        \App\Events\SocketMessageDeleted::dispatch($message);

        // Now delete the message
        $message->delete();
        
        \Log::info('Message deleted successfully', [
            'message_id' => $message->id
        ]);
        
        // For the response, we'll just use the first group or conversation's last message
        // In a real app, you might want to handle this differently
        $lastMessage = null;
        if ($groups->count() > 0) {
            $lastMessage = Message::where('group_id', $groups->first()->id)
                ->where('id', '!=', $message->id)
                ->latest()
                ->first();
        } elseif ($conversations->count() > 0) {
            $conversation = $conversations->first();
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
        }
        
        return response()->json([
            'message' => $lastMessage ? new MessageResource($lastMessage) : null,
            'deleted_message' => $messageData
        ]);
    }
}
