<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_authenticated_users_can_access_notifications(): void
    {
        $this->get(route('notifications.index'))
            ->assertRedirect(route('login'));

        $user = User::factory()->create();
        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertStatus(200);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        
        $notification = DatabaseNotification::forceCreate([
            'id' => '11111111-1111-1111-1111-111111111111',
            'type' => 'App\Notifications\AccountAccessChanged',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => 'Security Update',
                'message' => 'Your password has been changed.',
                'url' => '/dashboard/profile',
            ],
        ]);

        $this->assertNull($notification->read_at);

        $this->actingAs($user)
            ->patch(route('notifications.read', $notification->id))
            ->assertRedirect();

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    public function test_user_can_delete_notification(): void
    {
        $user = User::factory()->create();
        
        $notification = DatabaseNotification::forceCreate([
            'id' => '22222222-2222-2222-2222-222222222222',
            'type' => 'App\Notifications\AccountAccessChanged',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => 'System Update',
                'message' => 'Cache cleaned.',
            ],
        ]);

        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);

        $this->actingAs($user)
            ->delete(route('notifications.destroy', $notification->id))
            ->assertRedirect();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_user_can_clear_all_notifications_history(): void
    {
        $user = User::factory()->create();
        
        DatabaseNotification::forceCreate([
            'id' => '33333333-3333-3333-3333-333333333333',
            'type' => 'App\Notifications\AccountAccessChanged',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => ['title' => 'Note 1', 'message' => 'Msg 1'],
        ]);

        DatabaseNotification::forceCreate([
            'id' => '44444444-4444-4444-4444-444444444444',
            'type' => 'App\Notifications\AccountAccessChanged',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => ['title' => 'Note 2', 'message' => 'Msg 2'],
        ]);

        $this->assertEquals(2, $user->notifications()->count());

        $this->actingAs($user)
            ->delete(route('notifications.clear-all'))
            ->assertRedirect();

        $this->assertEquals(0, $user->notifications()->count());
    }
}
