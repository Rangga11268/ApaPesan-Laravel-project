<?php

namespace App\Events;

use App\Models\User;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Http\Resources\MessageResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageReacted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Message $message,
        public User $user,
        public string $emoji,
        public string $action = 'added' // 'added' or 'removed'
    ) {}

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->message->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'emoji' => $this->emoji,
            'action' => $this->action,
            'reactions' => $this->message->reactions()
                ->selectRaw('emoji, COUNT(*) as count')
                ->groupBy('emoji')
                ->get()
                ->mapWithKeys(fn($r) => [$r->emoji => $r->count])
                ->toArray(),
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        if ($this->message->group_id) {
            $channels[] = new PrivateChannel('message.group.' . $this->message->group_id);
        } else {
            $ids = collect([$this->message->sender_id, $this->message->receiver_id])->sort()->implode('-');
            $channels[] = new PrivateChannel('message.user.' . $ids);
        }
        
        return $channels;
    }
}
