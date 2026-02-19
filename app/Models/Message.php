<?php

namespace App\Models;

use App\Observers\MessageObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;


#[ObservedBy(MessageObserver::class)]
class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'sender_id',
        'group_id',
        'receiver_id',
        'read_at',
        'reply_to_id',
        'edited_at',
        'pinned_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'edited_at' => 'datetime',
            'pinned_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the Message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(MessageAttachment::class);
    }

    /**
     * Get the message this is replying to.
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    /**
     * Get all replies to this message.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'reply_to_id');
    }

    /**
     * Get all reactions on this message.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class);
    }

    /**
     * Get users who starred this message.
     */
    public function starredBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'starred_messages')
            ->withTimestamps();
    }

    /**
     * Check if the message is starred by a specific user.
     */
    public function isStarredBy(User $user): bool
    {
        return $this->starredBy()->where('user_id', $user->id)->exists();
    }

    /**
     * Get all mentions in this message.
     */
    public function mentions(): HasMany
    {
        return $this->hasMany(MessageMention::class);
    }

    /**
     * Get users mentioned in this message.
     */
    public function mentionedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_mentions')
            ->withPivot(['is_read', 'read_at', 'mentioned_by'])
            ->withTimestamps();
    }

    /**
     * Check if the message has been edited.
     */
    public function isEdited(): bool
    {
        return $this->edited_at !== null;
    }

    /**
     * Check if the message is pinned.
     */
    public function isPinned(): bool
    {
        return $this->pinned_at !== null;
    }

    /**
     * Check if the message has been read.
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
