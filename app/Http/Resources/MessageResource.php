<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\MessageAttachmentResource;
use Illuminate\Support\Facades\Auth;

class MessageResource extends JsonResource
{

    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'sender' => new UserResource($this->sender),
            'group_id' => $this->group_id,
            'attachments' => MessageAttachmentResource::collection($this->attachments),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // New fields for enhanced features
            'read_at' => $this->read_at,
            'reply_to_id' => $this->reply_to_id,
            'reply_to' => $this->when($this->reply_to_id, function() {
                return $this->replyTo ? [
                    'id' => $this->replyTo->id,
                    'message' => $this->replyTo->message,
                    'sender' => new UserResource($this->replyTo->sender),
                    'attachments' => $this->replyTo->attachments->count(),
                ] : null;
            }),
            'edited_at' => $this->edited_at,
            'pinned_at' => $this->pinned_at,
            'reactions' => $this->when($this->relationLoaded('reactions'), function() {
                return $this->reactions
                    ->groupBy('emoji')
                    ->map(fn($group) => [
                        'count' => $group->count(),
                        'users' => $group->map(fn($r) => [
                            'id' => $r->user_id,
                            'name' => $r->user->name ?? null,
                        ])->values(),
                    ]);
            }, []),
            'is_starred' => $this->when(Auth::check(), function() {
                return $this->starredBy()->where('user_id', Auth::id())->exists();
            }, false),
        ];
    }
}
