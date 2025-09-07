<?php

namespace App\Observers;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    public function deleting(Message $message)
    {
        $message->attachments->each(function ($attachment) {
            $dir = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($dir);
        });

        $message->attachments()->delete();

        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();
            if ($group) {
                $prevMessage = Message::where('group_id', $message->group_id)
                    ->where('id', '!=', $message->id)
                    ->latest()
                    ->limit(1)
                    ->first();

                if ($prevMessage) {
                    $group->last_message_id = $prevMessage->id;
                    $group->save();
                } else {
                    // If no previous message, clear the last_message_id
                    $group->last_message_id = null;
                    $group->save();
                }
            }
        } else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();
            if ($conversation) {
                $prevMessage = Message::where(function ($query) use ($message) {
                    $query->where('sender_id', $message->sender_id)
                        ->where('receiver_id', $message->receiver_id);
                })
                ->orWhere(function ($query) use ($message) {
                    $query->where('sender_id', $message->receiver_id)
                        ->where('receiver_id', $message->sender_id);
                })
                ->where('id', '!=', $message->id)
                ->latest()
                ->limit(1)
                ->first();

                if ($prevMessage) {
                    $conversation->last_message_id = $prevMessage->id;
                    $conversation->save();
                } else {
                    // If no previous message, clear the last_message_id
                    $conversation->last_message_id = null;
                    $conversation->save();
                }
            }
        }
    }
}
