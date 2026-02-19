<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Determine if the user can view this conversation (private chat).
     */
    public function view(User $user, Conversation $conversation): bool
    {
        // User can view a conversation only if they are one of the two participants
        return $conversation->user_id1 === $user->id || $conversation->user_id2 === $user->id;
    }

    /**
     * Determine if the user can access messages in this conversation.
     */
    public function viewMessages(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }

    /**
     * Determine if the user can search messages in this conversation.
     */
    public function searchMessages(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}
