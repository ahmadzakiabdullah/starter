<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AccountAccessChanged extends Notification
{
    use Queueable;

    public function __construct(private readonly string $message)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Account access updated',
            'message' => $this->message,
            'url' => route('profile.edit'),
        ];
    }
}
