<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StarredMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
    ];

    /**
     * Get the message that is starred.
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Get the user who starred the message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
