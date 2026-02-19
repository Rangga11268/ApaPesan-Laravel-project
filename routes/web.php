<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TypingController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\StarredMessageController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\MentionController;
use App\Http\Controllers\PinnedMessageController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('dashboard');
    Route::get('user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    // Messages - with rate limiting
    Route::middleware(['throttle:message-send'])->group(function () {
        Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    });
    Route::patch('/message/{message}', [MessageController::class, 'update'])->name('message.update');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    Route::post('/message/read', [MessageController::class, 'markAsRead'])->name('message.read');

    // Search - with rate limiting
    Route::middleware(['throttle:search'])->group(function () {
        Route::get('/message/search', [MessageController::class, 'search'])->name('message.search');
    });

    // Typing indicator
    Route::post('/typing', [TypingController::class, 'store'])->name('typing.store');

    // Reactions - with rate limiting
    Route::middleware(['throttle:reactions'])->group(function () {
        Route::post('/message/{message}/reaction', [ReactionController::class, 'store'])->name('reaction.store');
        Route::delete('/message/{message}/reaction/{emoji}', [ReactionController::class, 'destroy'])->name('reaction.destroy');
    });

    // Starred messages
    Route::get('/starred', [StarredMessageController::class, 'index'])->name('starred.index');
    Route::post('/message/{message}/star', [StarredMessageController::class, 'store'])->name('starred.store');
    Route::delete('/message/{message}/star', [StarredMessageController::class, 'destroy'])->name('starred.destroy');

    // Mentions
    Route::get('/mentions', [MentionController::class, 'index'])->name('mentions.index');
    Route::get('/mentions/unread-count', [MentionController::class, 'unreadCount'])->name('mentions.unreadCount');
    Route::post('/mentions/read', [MentionController::class, 'markAsRead'])->name('mentions.markAsRead');
    Route::post('/mentions/read-all', [MentionController::class, 'markAllAsRead'])->name('mentions.markAllAsRead');
    Route::get('/mentions/search-users', [MentionController::class, 'searchUsers'])->name('mentions.searchUsers');

    // Pinned messages
    Route::get('/pinned', [PinnedMessageController::class, 'index'])->name('pinned.index');
    Route::post('/message/{message}/pin', [PinnedMessageController::class, 'store'])->name('pinned.store');
    Route::delete('/message/{message}/pin', [PinnedMessageController::class, 'destroy'])->name('pinned.destroy');

    // Groups - with rate limiting
    Route::middleware(['throttle:group-operations'])->group(function () {
        Route::post('/group', [GroupController::class, 'store'])->name('group.store');
        Route::patch('/group/{group}', [GroupController::class, 'update'])->name('group.update');
        Route::delete('/group/{group}', [GroupController::class, 'destroy'])->name('group.destroy');
        Route::post('/group/{group}/member', [GroupController::class, 'addMember'])->name('group.addMember');
        Route::delete('/group/{group}/member/{user}', [GroupController::class, 'removeMember'])->name('group.removeMember');
    });
    Route::get('/group/{group}/available-users', [GroupController::class, 'availableUsers'])->name('group.availableUsers');

    // Export - with rate limiting (heavy operation)
    Route::middleware(['throttle:export'])->group(function () {
        Route::get('/chat/export/{type}/{id}', [ExportController::class, 'export'])->name('chat.export');
    });
});

// Health check endpoints (no auth required for monitoring)
Route::get('/health', [HealthController::class, 'index'])->name('health.index');
Route::get('/health/detailed', [HealthController::class, 'detailed'])->name('health.detailed');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
