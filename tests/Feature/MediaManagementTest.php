<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MediaManagementTest extends TestCase
{
    use RefreshDatabase;

    private function createMediaManager(): User
    {
        $role = Role::findOrCreate('admin');
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_media_manager_can_upload_an_allowed_file(): void
    {
        Storage::fake('public');
        $user = $this->createMediaManager();

        $this->actingAs($user)
            ->post(route('media.upload'), [
                'file' => UploadedFile::fake()->image('document.jpg'),
                'folder' => 'documents',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $media = Media::firstOrFail();

        $this->assertSame('document.jpg', $media->name);
        $this->assertSame('documents', $media->folder);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_media_manager_cannot_upload_a_disallowed_file_type(): void
    {
        $user = $this->createMediaManager();

        $this->actingAs($user)
            ->post(route('media.upload'), [
                'file' => UploadedFile::fake()->create('payload.php', 10, 'application/x-php'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount('media', 0);
    }

    public function test_media_manager_can_rename_a_media_record(): void
    {
        $user = $this->createMediaManager();
        $media = Media::create($this->mediaAttributes(['name' => 'before.jpg']));

        $this->actingAs($user)
            ->patch(route('media.rename', $media), ['name' => 'after.jpg'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('media', ['id' => $media->id, 'name' => 'after.jpg']);
    }

    public function test_media_manager_can_delete_a_media_file_and_record(): void
    {
        Storage::fake('public');
        $user = $this->createMediaManager();
        $attributes = $this->mediaAttributes();
        Storage::disk('public')->put($attributes['path'], 'file content');
        $media = Media::create($attributes);

        $this->actingAs($user)
            ->delete(route('media.destroy', $media))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('public')->assertMissing($attributes['path']);
    }

    public function test_media_manager_can_bulk_delete_media(): void
    {
        Storage::fake('public');
        $user = $this->createMediaManager();
        $first = Media::create($this->mediaAttributes(['path' => 'media/first.jpg', 'file_name' => 'first.jpg']));
        $second = Media::create($this->mediaAttributes(['path' => 'media/second.jpg', 'file_name' => 'second.jpg']));
        Storage::disk('public')->put($first->path, 'first');
        Storage::disk('public')->put($second->path, 'second');

        $this->actingAs($user)
            ->post(route('media.bulk-destroy'), ['ids' => [$first->id, $second->id]])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseCount('media', 0);
        Storage::disk('public')->assertMissing($first->path);
        Storage::disk('public')->assertMissing($second->path);
    }

    public function test_regular_user_cannot_manage_media(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('media.index'))->assertForbidden();
        $this->actingAs($user)->post(route('media.upload'), [
            'file' => UploadedFile::fake()->image('document.jpg'),
        ])->assertForbidden();
    }

    /** @return array<string, mixed> */
    private function mediaAttributes(array $overrides = []): array
    {
        return array_merge([
            'name' => 'example.jpg',
            'file_name' => 'example.jpg',
            'mime_type' => 'image/jpeg',
            'path' => 'media/example.jpg',
            'size' => 12,
            'folder' => null,
            'disk' => 'public',
        ], $overrides);
    }
}
