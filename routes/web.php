<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TypingController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\StarredMessageController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ExportController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class, 'home'])->name('dashboard');
    Route::get('user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    // Messages
    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::patch('/message/{message}', [MessageController::class, 'update'])->name('message.update');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    Route::post('/message/read', [MessageController::class, 'markAsRead'])->name('message.read');
    Route::get('/message/search', [MessageController::class, 'search'])->name('message.search');

    // Typing indicator
    Route::post('/typing', [TypingController::class, 'store'])->name('typing.store');

    // Reactions
    Route::post('/message/{message}/reaction', [ReactionController::class, 'store'])->name('reaction.store');
    Route::delete('/message/{message}/reaction/{emoji}', [ReactionController::class, 'destroy'])->name('reaction.destroy');

    // Starred messages
    Route::get('/starred', [StarredMessageController::class, 'index'])->name('starred.index');
    Route::post('/message/{message}/star', [StarredMessageController::class, 'store'])->name('starred.store');
    Route::delete('/message/{message}/star', [StarredMessageController::class, 'destroy'])->name('starred.destroy');

    // Groups
    Route::post('/group', [GroupController::class, 'store'])->name('group.store');
    Route::patch('/group/{group}', [GroupController::class, 'update'])->name('group.update');
    Route::delete('/group/{group}', [GroupController::class, 'destroy'])->name('group.destroy');
    Route::post('/group/{group}/member', [GroupController::class, 'addMember'])->name('group.addMember');
    Route::delete('/group/{group}/member/{user}', [GroupController::class, 'removeMember'])->name('group.removeMember');
    Route::get('/group/{group}/available-users', [GroupController::class, 'availableUsers'])->name('group.availableUsers');

    // Export
    Route::get('/chat/export/{type}/{id}', [ExportController::class, 'export'])->name('chat.export');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
