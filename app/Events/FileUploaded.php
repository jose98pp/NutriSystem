<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FileUploaded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $fileType;
    public $fileUrl;
    public $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct($userId, $fileType, $fileUrl, $metadata = [])
    {
        $this->userId = $userId;
        $this->fileType = $fileType;
        $this->fileUrl = $fileUrl;
        $this->metadata = $metadata;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'file_type' => $this->fileType,
            'file_url' => $this->fileUrl,
            'metadata' => $this->metadata,
            'timestamp' => now()->toISOString(),
        ];
    }
}
