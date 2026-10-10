<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MessageReaction;
use App\Events\MessageReacted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReactionController extends Controller
{
    /**
     * Add a reaction to a message.
     */
    public function store(Request $request, Message $message)
    {
        // Authorization: user must be able to view the message to react
        $this->authorize('view', $message);

        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $user = Auth::user();
        $emoji = $request->emoji;

        // Check if reaction already exists
        $existing = MessageReaction::where([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => $emoji,
        ])->first();

        if ($existing) {
            return response()->json(['message' => 'Reaction already exists'], 409);
        }

        $reaction = MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);

        try {
            MessageReacted::dispatch($message, $user, $emoji, 'added');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Broadcast failed for MessageReacted (added): ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'reaction' => $reaction,
        ]);
    }

    /**
     * Remove a reaction from a message.
     */
    public function destroy(Message $message, string $emoji)
    {
        // Authorization: user must be able to view the message
        $this->authorize('view', $message);

        $user = Auth::user();

        $reaction = MessageReaction::where([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => $emoji,
        ])->first();

        if (!$reaction) {
            return response()->json(['message' => 'Reaction not found'], 404);
        }

        $reaction->delete();

        try {
            MessageReacted::dispatch($message, $user, $emoji, 'removed');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Broadcast failed for MessageReacted (removed): ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }
}
