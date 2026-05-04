<?php

declare(strict_types=1);

namespace App\Providers;

use App\Http\Middleware\ResponseTimeMiddleware;
use App\Models\Question;
use App\Models\User;
use App\Observers\QuestionObserver;
use App\Observers\UserObserver;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        $this->bootRedisGracefulFallback();
        $this->bootNonProductionGuards();
        $this->bootRateLimiters();
        $this->bootObservers();
        $this->bootEmailVerification();
    }

    private function bootRedisGracefulFallback(): void
    {
        // Only attempt Redis if it's configured as the cache or queue driver.
        // On failure, silently downgrade to database drivers. This allows
        // the .env to say CACHE_STORE=redis in production and self-heal
        // when Redis is temporarily unavailable.
        if (
            ! in_array(config('cache.default'), ['redis'], true)
            && ! in_array(config('queue.default'), ['redis'], true)
        ) {
            return;
        }

        try {
            Cache::store('redis')->get('__lumio_health__');
        } catch (\Throwable) {
            config(['cache.default' => 'database']);
            config(['queue.default' => 'database']);
            config(['session.driver' => 'database']);
            logger()->warning('Redis unavailable — falling back to database drivers');
        }
    }

    private function bootNonProductionGuards(): void
    {
        if ($this->app->isProduction()) {
            return;
        }

        // Surface N+1 queries in tests and local dev immediately
        Model::preventLazyLoading();
        Model::preventSilentlyDiscardingAttributes();

        // X-Response-Time header on every API response in non-production
        Route::pushMiddlewareToGroup('api', ResponseTimeMiddleware::class);
    }

    private function bootRateLimiters(): void
    {
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)->by($request->ip()),
        );

        RateLimiter::for('register', fn (Request $request) => Limit::perMinute(3)->by($request->ip()),
        );

        // 3 attempts per hour per IP; plus 1 per 5 minutes per user email
        RateLimiter::for('password-reset', fn (Request $request) => [
            Limit::perHour(3)->by($request->ip()),
            Limit::perMinutes(5, 1)->by($request->input('email', $request->ip())),
        ],
        );

        RateLimiter::for('otp-send', fn (Request $request) => Limit::perMinutes(5, 1)->by($request->input('phone', $request->ip())),
        );

        RateLimiter::for('otp-verify', fn (Request $request) => Limit::perMinute(10)->by($request->ip()),
        );

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()),
        );

        // AI feature rate limits — generous enough for real usage, tight enough to prevent abuse
        RateLimiter::for('ai-explanation', fn (Request $request) => Limit::perMinute(20)->by($request->user()?->id ?: $request->ip()),
        );

        RateLimiter::for('ai-tutor', fn (Request $request) => Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
        );

        RateLimiter::for('ai-study-plan', fn (Request $request) => Limit::perDay(3)->by($request->user()?->id ?: $request->ip()),
        );
    }

    private function bootObservers(): void
    {
        User::observe(UserObserver::class);
        Question::observe(QuestionObserver::class);
    }

    private function bootEmailVerification(): void
    {
        VerifyEmail::createUrlUsing(function (User $notifiable): string {
            return URL::temporarySignedRoute(
                'api.v1.auth.verification.verify',
                now()->addMinutes(60),
                ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
            );
        });
    }
}
