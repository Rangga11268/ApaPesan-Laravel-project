<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('online', function (User $user) {
    return $user ? ['id' => $user->id, 'name' => $user->name] : null;
});

Broadcast::channel('message.user.{userId1}-{userId2}', function (User $user, int $userId1, int $userId2) {
    return (int) $user->id === (int) $userId1 || (int) $user->id === (int) $userId2 ? $user : null;
});

Broadcast::channel('message.group.{groupId}', function (User $user, int $groupId) {
    return $user->groups()->where('groups.id', $groupId)->exists() ? $user : null;
});

Broadcast::channel('message.new.to.user.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId ? $user : null;
});

Broadcast::channel('message.deleted.user.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId ? $user : null;
});
