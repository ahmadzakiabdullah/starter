<?php

namespace Database\Factories;

use App\Models\Changelog;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Changelog> */
class ChangelogFactory extends Factory
{
    protected $model = Changelog::class;

    public function definition(): array
    {
        return [
            'version' => 'v'.fake()->unique()->numerify('#.#.#'),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'changes' => [['type' => 'Added', 'content' => fake()->sentence()]],
            'release_date' => fake()->date(),
            'is_published' => true,
        ];
    }
}
