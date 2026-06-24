<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SystemSettingsUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $actorName) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'System settings updated',
            'message' => "{$this->actorName} updated the system settings.",
            'url' => route('settings.edit'),
        ];
    }
}
