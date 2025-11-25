<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPresence extends Model
{
    protected $table = 'user_presence';

    protected $fillable = [
        'user_id',
        'status',
        'last_seen_at',
        'socket_id',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];

    /**
     * Get the user that owns the presence.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user is online.
     */
    public function isOnline(): bool
    {
        return $this->status === 'online';
    }

    /**
     * Check if user is away.
     */
    public function isAway(): bool
    {
        return $this->status === 'away';
    }

    /**
     * Get formatted last seen time.
     */
    public function getLastSeenFormatted(): string
    {
        if ($this->isOnline()) {
            return 'En línea';
        }

        if (!$this->last_seen_at) {
            return 'Nunca';
        }

        return $this->last_seen_at->diffForHumans();
    }
}
