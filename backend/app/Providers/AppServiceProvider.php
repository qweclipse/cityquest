<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;

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
        RateLimiter::for('cityquest-auth', fn (Request $request) => Limit::perMinute(8)->by($request->ip()));

        RateLimiter::for('place-submission', function (Request $request) {
            return Limit::perHour(6)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('correction-suggestion', function (Request $request) {
            return Limit::perHour(12)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('route-generation', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });
    }
}
