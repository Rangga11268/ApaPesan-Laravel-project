<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\Message;
use App\Models\Group;
use App\Models\Conversation;
use App\Policies\MessagePolicy;
use App\Policies\GroupPolicy;
use App\Policies\ConversationPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register policies
        Gate::policy(Message::class, MessagePolicy::class);
        Gate::policy(Group::class, GroupPolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);
    }
}
