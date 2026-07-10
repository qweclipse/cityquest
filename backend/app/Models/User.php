<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_USER = 'user';
    public const ROLE_MODERATOR = 'moderator';
    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'preferred_city_id',
        'preferred_language',
        'preferred_theme',
        'level',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'level' => 'integer',
        ];
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    public function canModerate(): bool
    {
        return $this->hasRole(self::ROLE_MODERATOR, self::ROLE_ADMIN);
    }

    public function preferredCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'preferred_city_id');
    }

    public function createdPlaces(): HasMany
    {
        return $this->hasMany(Place::class, 'created_by_user_id');
    }

    public function routes(): HasMany
    {
        return $this->hasMany(Route::class);
    }

    public function savedRoutes(): BelongsToMany
    {
        return $this->belongsToMany(Route::class, 'saved_routes')->withTimestamps();
    }

    public function favoritePlaces(): BelongsToMany
    {
        return $this->belongsToMany(Place::class, 'favorite_places')->withTimestamps();
    }

    public function likedRoutes(): BelongsToMany
    {
        return $this->belongsToMany(Route::class, 'route_likes')->withTimestamps();
    }

    public function routeActivities(): HasMany
    {
        return $this->hasMany(RouteActivity::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('unlocked_at')
            ->withTimestamps();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
