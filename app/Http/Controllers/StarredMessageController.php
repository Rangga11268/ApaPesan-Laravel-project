<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\StarredMessage;
use App\Http\Resources\MessageResource;
use Illuminate\Support\Facades\Auth;

class StarredMessageController extends Controller
{
    /**
     * List all starred messages for the current user.
     */
    public function index()
    {
        $user = Auth::user();

        $starred = StarredMessage::where('user_id', $user->id)
            ->with(['message.sender', 'message.attachments', 'message.replyTo'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $starred->through(fn($s) => new MessageResource($s->message)),
            'pagination' => [
                'current_page' => $starred->currentPage(),
                'last_page' => $starred->lastPage(),
                'per_page' => $starred->perPage(),
                'total' => $starred->total(),
            ],
        ]);
    }

    /**
     * Star a message.
     */
    public function store(Message $message)
    {
        // Authorization: user must be able to view the message to star it
        $this->authorize('view', $message);

        $user = Auth::user();

        // Check if already starred
        $existing = StarredMessage::where([
            'message_id' => $message->id,
            'user_id' => $user->id,
        ])->first();

        if ($existing) {
            return response()->json(['message' => 'Already starred'], 409);
        }

        StarredMessage::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Unstar a message.
     */
    public function destroy(Message $message)
    {
        // Authorization: user must be able to view the message
        $this->authorize('view', $message);

        $user = Auth::user();

        $starred = StarredMessage::where([
            'message_id' => $message->id,
            'user_id' => $user->id,
        ])->first();

        if (!$starred) {
            return response()->json(['message' => 'Not starred'], 404);
        }

        $starred->delete();

        return response()->json(['success' => true]);
    }
}
