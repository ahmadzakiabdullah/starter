<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Media> */
class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition(): array
    {
        $fileName = Str::lower(fake()->unique()->bothify('file_####??')).'.jpg';

        return [
            'name' => $fileName,
            'file_name' => $fileName,
            'mime_type' => 'image/jpeg',
            'path' => "media/{$fileName}",
            'size' => fake()->numberBetween(1_024, 10_485_760),
            'folder' => fake()->optional()->word(),
            'disk' => 'public',
        ];
    }
}
