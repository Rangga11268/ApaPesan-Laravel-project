<?php

namespace App\Http\Controllers;

use App\Events\UserTyping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TypingController extends Controller
{
    /**
     * Broadcast that the current user is typing.
     */
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required_without:group_id|nullable|exists:users,id',
            'group_id' => 'required_without:receiver_id|nullable|exists:groups,id',
        ]);

        try {
            UserTyping::dispatch(
                Auth::user(),
                $request->receiver_id,
                $request->group_id
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Broadcast failed for UserTyping: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }
}
