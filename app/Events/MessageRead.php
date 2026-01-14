<?php

namespace App\Events;

use App\Models\User;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public array $messageIds,
        public User $reader,
        public ?int $senderId = null,
        public ?int $groupId = null
    ) {}

    public function broadcastWith(): array
    {
        return [
            'message_ids' => $this->messageIds,
            'reader' => [
                'id' => $this->reader->id,
                'name' => $this->reader->name,
            ],
            'read_at' => now()->toISOString(),
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
        
        if ($this->groupId) {
            $channels[] = new PrivateChannel('message.group.' . $this->groupId);
        } elseif ($this->senderId) {
            $ids = collect([$this->reader->id, $this->senderId])->sort()->implode('-');
            $channels[] = new PrivateChannel('message.user.' . $ids);
        }
        
        return $channels;
    }
}
