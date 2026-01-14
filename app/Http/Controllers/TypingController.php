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

        UserTyping::dispatch(
            Auth::user(),
            $request->receiver_id,
            $request->group_id
        );

        return response()->json(['success' => true]);
    }
}
