<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    use HasFactory;

    public const SOURCE_GENERATED = 'generated';
    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_SHARED = 'shared';

    protected $fillable = [
        'user_id',
        'city_id',
        'title',
        'slug',
        'description',
        'route_type',
        'vibe',
        'duration_minutes',
        'distance_km',
        'budget_min',
        'budget_max',
        'currency_code',
        'is_public',
        'likes_count',
        'saves_count',
        'image_url',
        'created_source',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'distance_km' => 'decimal:2',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'is_public' => 'boolean',
            'likes_count' => 'integer',
            'saves_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function points(): HasMany
    {
        return $this->hasMany(RoutePoint::class)->orderBy('order_number');
    }

    public function places(): BelongsToMany
    {
        return $this->belongsToMany(Place::class, 'route_points')
            ->withPivot('order_number', 'estimated_duration_minutes', 'note')
            ->withTimestamps()
            ->orderBy('route_points.order_number');
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_routes')->withTimestamps();
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'route_likes')->withTimestamps();
    }

    public function routeActivities(): HasMany
    {
        return $this->hasMany(RouteActivity::class);
    }
}
