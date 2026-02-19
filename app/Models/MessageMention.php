<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageMention extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'mentioned_by',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * The message that contains this mention.
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * The user who was mentioned.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The user who created the mention (message sender).
     */
    public function mentionedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentioned_by');
    }

    /**
     * Mark this mention as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Get unread mentions for a user.
     */
    public static function getUnreadForUser(int $userId)
    {
        return static::where('user_id', $userId)
            ->where('is_read', false)
            ->with(['message.sender', 'message.group', 'mentionedBy'])
            ->latest()
            ->get();
    }

    /**
     * Get count of unread mentions for a user.
     */
    public static function getUnreadCountForUser(int $userId): int
    {
        return static::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}
