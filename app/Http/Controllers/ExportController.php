<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExportController extends Controller
{
    /**
     * Export chat history.
     */
    public function export(Request $request, string $type, int $id)
    {
        $user = Auth::user();
        $messages = collect();
        $chatName = '';

        if ($type === 'user') {
            // Export 1-on-1 conversation
            $otherUser = \App\Models\User::findOrFail($id);
            $chatName = $otherUser->name;

            $messages = Message::where(function ($query) use ($user, $id) {
                $query->where('sender_id', $user->id)
                    ->where('receiver_id', $id);
            })->orWhere(function ($query) use ($user, $id) {
                $query->where('sender_id', $id)
                    ->where('receiver_id', $user->id);
            })
                ->with(['sender', 'attachments'])
                ->orderBy('created_at')
                ->get();
        } elseif ($type === 'group') {
            // Export group conversation
            $group = Group::findOrFail($id);

            // Authorization: user must be member of group
            $this->authorize('view', $group);

            $chatName = $group->name;

            $messages = Message::where('group_id', $id)
                ->with(['sender', 'attachments'])
                ->orderBy('created_at')
                ->get();
        } else {
            return response()->json(['message' => 'Invalid type'], 400);
        }

        $format = $request->query('format', 'json');

        if ($format === 'txt') {
            return $this->exportAsTxt($messages, $chatName);
        }

        return $this->exportAsJson($messages, $chatName);
    }

    /**
     * Export as JSON.
     */
    private function exportAsJson($messages, $chatName)
    {
        $data = [
            'chat_name' => $chatName,
            'exported_at' => now()->toISOString(),
            'message_count' => $messages->count(),
            'messages' => $messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'sender' => $message->sender->name,
                    'message' => $message->message,
                    'attachments' => $message->attachments->map(fn($a) => [
                        'name' => $a->name,
                        'type' => $a->mime,
                    ]),
                    'created_at' => $message->created_at->toISOString(),
                    'edited_at' => $message->edited_at?->toISOString(),
                ];
            }),
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="chat_' . str_replace(' ', '_', $chatName) . '_' . date('Y-m-d') . '.json"');
    }

    /**
     * Export as plain text.
     */
    private function exportAsTxt($messages, $chatName)
    {
        $content = "Chat Export: {$chatName}\n";
        $content .= "Exported at: " . now()->format('Y-m-d H:i:s') . "\n";
        $content .= "Messages: " . $messages->count() . "\n";
        $content .= str_repeat('=', 50) . "\n\n";

        foreach ($messages as $message) {
            $timestamp = $message->created_at->format('Y-m-d H:i:s');
            $sender = $message->sender->name;
            $text = $message->message ?? '[Attachment]';
            $edited = $message->edited_at ? ' (edited)' : '';

            $content .= "[{$timestamp}] {$sender}{$edited}:\n";
            $content .= "{$text}\n";

            if ($message->attachments->count() > 0) {
                foreach ($message->attachments as $attachment) {
                    $content .= "  📎 {$attachment->name} ({$attachment->mime})\n";
                }
            }
            $content .= "\n";
        }

        return response($content, 200)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="chat_' . str_replace(' ', '_', $chatName) . '_' . date('Y-m-d') . '.txt"');
    }
}
