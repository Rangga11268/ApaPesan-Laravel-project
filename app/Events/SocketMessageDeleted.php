<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use App\Http\Resources\MessageResource;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class SocketMessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Message $message,
        public ?Message $previousMessage = null
    ) {
        //
    }

    public function broadcastWith(): array
    {
        return [
            'message' => new MessageResource($this->message),
            'prevMessage' => $this->previousMessage ? new MessageResource($this->previousMessage) : null
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $me = $this->message;
        $channels = [];
        if ($me->group_id) {
            $channels[] = new PrivateChannel('message.group.' . $me->group_id);
        } else {
            $channels[] = new PrivateChannel('message.user.' . collect([$me->sender_id, $me->receiver_id])->sort()->implode('-'));
        }
        return $channels;
    }
}