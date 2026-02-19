<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
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

        // Rate Limiters for API protection
        $this->configureRateLimiting();
    }

    /**
     * Configure rate limiting for various endpoints.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limit: 60 requests per minute
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Message sending: 30 messages per minute per user
        RateLimiter::for('message-send', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many messages. Please slow down.',
                    ], 429);
                });
        });

        // File uploads: 10 uploads per minute per user
        RateLimiter::for('upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Upload limit exceeded. Please wait.',
                    ], 429);
                });
        });

        // Search: 20 searches per minute
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many search requests. Please wait.',
                    ], 429);
                });
        });

        // Reactions: 60 reactions per minute
        RateLimiter::for('reactions', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Authentication attempts: 5 per minute
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('email') . '|' . $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many login attempts. Please try again later.',
                    ], 429);
                });
        });

        // Group operations: 20 per minute
        RateLimiter::for('group-operations', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        // Export: 5 per minute (heavy operation)
        RateLimiter::for('export', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Export limit exceeded. Please wait.',
                    ], 429);
                });
        });
    }
}
