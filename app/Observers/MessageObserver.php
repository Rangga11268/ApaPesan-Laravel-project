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
        // Handle attachment deletion
        $message->attachments->each(function ($attachment) {
            $dir = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($dir);
        });

        $message->attachments()->delete();

        // Note: Group/Conversation last_message_id updates are now handled in the controller
        // to ensure they happen before the message is deleted
    }
}
