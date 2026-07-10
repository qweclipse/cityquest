<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Place extends Model
{
    use HasFactory;

    public const STATUS_VERIFIED = 'verified';
    public const STATUS_COMMUNITY_CONFIRMED = 'community_confirmed';
    public const STATUS_USER_ADDED = 'user_added';
    public const STATUS_NEEDS_REVIEW = 'needs_review';
    public const STATUS_NEEDS_LOCATION_REVIEW = 'needs_location_review';
    public const STATUS_NEEDS_IMAGE_REVIEW = 'needs_image_review';
    public const STATUS_NEEDS_SOURCE_REVIEW = 'needs_source_review';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CLOSED = 'closed';

    public const SOURCE_MANUAL = 'manual';
    public const SOURCE_OFFICIAL = 'official';
    public const SOURCE_COMMUNITY = 'community';
    public const SOURCE_IMPORTED = 'imported';

    public const TRUSTED_STATUSES = [
        self::STATUS_VERIFIED,
        self::STATUS_COMMUNITY_CONFIRMED,
    ];

    public const PUBLIC_ACTIVE_STATUSES = [
        self::STATUS_VERIFIED,
        self::STATUS_COMMUNITY_CONFIRMED,
        self::STATUS_USER_ADDED,
    ];

    public const MODERATION_STATUSES = [
        self::STATUS_USER_ADDED,
        self::STATUS_NEEDS_REVIEW,
        self::STATUS_NEEDS_LOCATION_REVIEW,
        self::STATUS_NEEDS_IMAGE_REVIEW,
        self::STATUS_NEEDS_SOURCE_REVIEW,
    ];

    public const ALL_STATUSES = [
        self::STATUS_VERIFIED,
        self::STATUS_COMMUNITY_CONFIRMED,
        self::STATUS_USER_ADDED,
        self::STATUS_NEEDS_REVIEW,
        self::STATUS_NEEDS_LOCATION_REVIEW,
        self::STATUS_NEEDS_IMAGE_REVIEW,
        self::STATUS_NEEDS_SOURCE_REVIEW,
        self::STATUS_REJECTED,
        self::STATUS_CLOSED,
    ];

    protected $fillable = [
        'city_id',
        'created_by_user_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'address',
        'lat',
        'lng',
        'average_price_min',
        'average_price_max',
        'currency_code',
        'visit_duration_minutes',
        'verification_status',
        'source_type',
        'official_url',
        'google_maps_url',
        'yandex_maps_url',
        'external_source_url',
        'image_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'average_price_min' => 'decimal:2',
            'average_price_max' => 'decimal:2',
            'visit_duration_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PlacePhoto::class);
    }

    public function routePoints(): HasMany
    {
        return $this->hasMany(RoutePoint::class);
    }

    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorite_places')->withTimestamps();
    }

    public function correctionSuggestions(): HasMany
    {
        return $this->hasMany(PlaceCorrectionSuggestion::class);
    }

    public function isTrustedForRoutes(): bool
    {
        return $this->is_active && in_array($this->verification_status, self::TRUSTED_STATUSES, true);
    }
}
