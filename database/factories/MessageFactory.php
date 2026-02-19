<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sender_id' => User::factory(),
            'receiver_id' => User::factory(),
            'group_id' => null,
            'message' => $this->faker->realText(200),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Create a private message between two users.
     */
    public function private(): static
    {
        return $this->state(fn(array $attributes) => [
            'group_id' => null,
        ]);
    }

    /**
     * Create a group message.
     */
    public function forGroup(Group $group): static
    {
        return $this->state(fn(array $attributes) => [
            'group_id' => $group->id,
            'receiver_id' => null,
        ]);
    }

    /**
     * Set the sender.
     */
    public function from(User $user): static
    {
        return $this->state(fn(array $attributes) => [
            'sender_id' => $user->id,
        ]);
    }

    /**
     * Set the receiver.
     */
    public function to(User $user): static
    {
        return $this->state(fn(array $attributes) => [
            'receiver_id' => $user->id,
        ]);
    }
}
