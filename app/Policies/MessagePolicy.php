<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    /**
     * Determine if the user can view a message.
     */
    public function view(User $user, Message $message): bool
    {
        // For private messages: user must be sender or receiver
        if (!$message->group_id) {
            return $message->sender_id === $user->id || $message->receiver_id === $user->id;
        }

        // For group messages: user must be a member of the group
        return $message->group()
            ->whereHas('users', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->exists();
    }

    /**
     * Determine if the user can update (edit) a message.
     */
    public function update(User $user, Message $message): bool
    {
        // Only the sender can edit a message
        return $message->sender_id === $user->id;
    }

    /**
     * Determine if the user can delete a message.
     */
    public function delete(User $user, Message $message): bool
    {
        // Only the sender can delete a message
        return $message->sender_id === $user->id;
    }

    /**
     * Determine if the user can mark messages as read.
     */
    public function markAsRead(User $user, Message $message): bool
    {
        // User can only mark messages they didn't send as read
        return $message->sender_id !== $user->id;
    }
}
