<?php

namespace App\Services;

use App\Models\Category;
use App\Models\City;
use App\Models\Place;
use App\Models\Route as CityRoute;
use App\Support\UniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RouteGenerationService
{
    /**
     * @param array<string, mixed> $input
     */
    public function generate(array $input): CityRoute
    {
        $preview = $this->preview($input);
        $variant = collect($preview['variants'])->firstWhere('variant', 'balanced')
            ?? $preview['variants'][0];

        return $this->persistPreview($input, $variant);
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array<string, mixed>
     */
    public function preview(array $input): array
    {
        $city = City::query()->findOrFail($input['city_id']);
        $duration = (int) ($input['duration_minutes'] ?? 180);
        $categoryIds = $this->resolveCategoryIds($input);
        $budgetMode = $input['budget_mode'] ?? 'any';
        $placeMode = $input['place_mode'] ?? 'verified_only';
        $routeType = $input['route_type'] ?? 'walk';
        $vibe = $input['vibe'] ?? 'balanced';

        $places = $this->candidatePlaces($city, $categoryIds, $placeMode, $budgetMode);

        if ($places->count() < 2) {
            throw ValidationException::withMessages([
                'places' => ['Not enough places for route preview with the selected filters.'],
            ]);
        }

        $scored = $this->scorePlaces($places, $city, $categoryIds, $budgetMode, $routeType, $vibe);

        return [
            'input' => [
                'budget_mode' => $budgetMode,
                'category_ids' => $categoryIds,
                'city_id' => $city->id,
                'duration_minutes' => $duration,
                'place_mode' => $placeMode,
                'route_type' => $routeType,
                'vibe' => $vibe,
            ],
            'variants' => collect($this->variantConfigs($duration))
                ->map(fn (array $config) => $this->buildVariant(
                    $config,
                    $scored,
                    $city,
                    $input,
                    $categoryIds,
                    $budgetMode,
                    $routeType,
                    $vibe,
                ))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param array<string, mixed> $input
     * @param array<string, mixed> $variant
     */
    public function persistPreview(array $input, array $variant, ?int $userId = null): CityRoute
    {
        $city = City::query()->findOrFail($input['city_id']);
        $variantPlaces = collect($variant['places'] ?? [])
            ->sortBy('order_number')
            ->values();
        $placeIds = $variantPlaces
            ->pluck('place_id')
            ->map(fn ($placeId) => (int) $placeId)
            ->unique()
            ->values();

        if ($placeIds->count() < 2 || $placeIds->count() > 7) {
            throw ValidationException::withMessages([
                'preview.places' => ['Choose a preview route with 2 to 7 places.'],
            ]);
        }

        $placesById = Place::query()
            ->with(['city', 'category'])
            ->where('city_id', $city->id)
            ->where('is_active', true)
            ->whereIn('id', $placeIds->all())
            ->get()
            ->keyBy('id');

        if ($placesById->count() !== $placeIds->count()) {
            throw ValidationException::withMessages([
                'preview.places' => ['One or more selected preview places are no longer available.'],
            ]);
        }

        $ordered = $variantPlaces->map(function (array $point) use ($placesById) {
            /** @var Place $place */
            $place = $placesById[(int) $point['place_id']];

            return [
                'place' => $place,
                'reason' => $point['reason'] ?? $this->placeReason($place, null, [], 'any'),
            ];
        });

        return DB::transaction(function () use ($city, $input, $ordered, $userId, $variant) {
            $title = (string) ($variant['title'] ?? $this->routeTitle($input, (string) ($variant['variant'] ?? 'balanced')));
            $description = (string) ($variant['description'] ?? $this->routeDescription($variant));

            $route = CityRoute::query()->create([
                'user_id' => $userId,
                'city_id' => $city->id,
                'title' => $title,
                'slug' => UniqueSlug::make(CityRoute::class, $title),
                'description' => $description,
                'route_type' => $input['route_type'] ?? $variant['route_type'] ?? 'walk',
                'vibe' => $input['vibe'] ?? $variant['vibe'] ?? 'balanced',
                'duration_minutes' => (int) ($variant['duration_minutes'] ?? $ordered->sum(fn (array $point) => (int) ($point['place']->visit_duration_minutes ?? 40))),
                'distance_km' => (float) ($variant['distance_km'] ?? $this->routeDistance($ordered->pluck('place'))),
                'budget_min' => (float) ($variant['price_min'] ?? $ordered->sum(fn (array $point) => (float) ($point['place']->average_price_min ?? 0))),
                'budget_max' => (float) ($variant['price_max'] ?? $ordered->sum(fn (array $point) => (float) ($point['place']->average_price_max ?? 0))),
                'currency_code' => $city->currency_code,
                'is_public' => false,
                'likes_count' => 0,
                'saves_count' => 0,
                'image_url' => $ordered->first()['place']->image_url ?? null,
                'created_source' => CityRoute::SOURCE_GENERATED,
            ]);

            foreach ($ordered as $index => $point) {
                /** @var Place $place */
                $place = $point['place'];

                $route->points()->create([
                    'place_id' => $place->id,
                    'order_number' => $index + 1,
                    'estimated_duration_minutes' => $place->visit_duration_minutes,
                    'note' => $point['reason'],
                ]);
            }

            return $route->load(['city', 'user', 'points.place.city', 'points.place.category']);
        });
    }

    /**
     * @param array<int> $categoryIds
     *
     * @return Collection<int, Place>
     */
    private function candidatePlaces(City $city, array $categoryIds, string $placeMode, string $budgetMode): Collection
    {
        $places = $this->candidateQuery($city, $categoryIds, $placeMode, $budgetMode)->get();

        if ($places->count() < 2 && $categoryIds !== []) {
            $places = $this->candidateQuery($city, [], $placeMode, $budgetMode)->get();
        }

        if ($places->count() < 2 && $budgetMode !== 'any') {
            $places = $this->candidateQuery($city, $categoryIds, $placeMode, 'any')->get();
        }

        return $places;
    }

    /**
     * @param array<int> $categoryIds
     */
    private function candidateQuery(City $city, array $categoryIds, string $placeMode, string $budgetMode): Builder
    {
        $statuses = Place::TRUSTED_STATUSES;

        return Place::query()
            ->with(['city', 'category'])
            ->where('city_id', $city->id)
            ->where('is_active', true)
            ->whereIn('verification_status', $statuses)
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->whereBetween('lat', [-90, 90])
            ->whereBetween('lng', [-180, 180])
            ->when($categoryIds !== [], fn (Builder $query) => $query->whereIn('category_id', $categoryIds))
            ->when($budgetMode === 'free', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereNull('average_price_max')
                ->orWhere('average_price_max', '<=', 0)))
            ->when($budgetMode === 'low', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereNull('average_price_min')
                ->orWhere('average_price_min', '<=', 150)))
            ->when($budgetMode === 'medium', fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->whereNull('average_price_min')
                ->orWhere('average_price_min', '<=', 400)));
    }

    /**
     * @param array<string, mixed> $input
     *
     * @return array<int>
     */
    private function resolveCategoryIds(array $input): array
    {
        $ids = collect($input['category_ids'] ?? [])->map(fn ($id) => (int) $id);
        $interests = collect($input['interests'] ?? [])->filter();

        if ($interests->isNotEmpty()) {
            $ids = $ids->merge(
                Category::query()
                    ->whereIn('slug', $interests->map(fn (string $interest) => str($interest)->slug()->toString()))
                    ->pluck('id'),
            );
        }

        return $ids->unique()->values()->all();
    }

    /**
     * @param Collection<int, Place> $places
     * @param array<int> $categoryIds
     *
     * @return Collection<int, array{place: Place, score: float}>
     */
    private function scorePlaces(
        Collection $places,
        City $city,
        array $categoryIds,
        string $budgetMode,
        string $routeType,
        string $vibe,
    ): Collection {
        return $places
            ->map(fn (Place $place) => [
                'place' => $place,
                'score' => $this->scorePlace($place, $city, $categoryIds, $budgetMode, $routeType, $vibe),
            ])
            ->sortByDesc('score')
            ->values();
    }

    /**
     * @param array<int> $categoryIds
     */
    private function scorePlace(
        Place $place,
        City $city,
        array $categoryIds,
        string $budgetMode,
        string $routeType,
        string $vibe,
    ): float {
        $categoryMatch = $categoryIds === [] || in_array($place->category_id, $categoryIds, true) ? 1 : 0;
        $verificationBonus = match ($place->verification_status) {
            Place::STATUS_VERIFIED => 1,
            Place::STATUS_COMMUNITY_CONFIRMED => 0.8,
            default => 0,
        };
        $budgetFit = $this->budgetFit($place, $budgetMode);
        $distanceFit = max(0, 1 - ($this->distanceKm((float) $city->lat, (float) $city->lng, (float) $place->lat, (float) $place->lng) / 10));
        $routeFit = $this->routeFit($place, $routeType, $vibe);

        return ($categoryMatch * 38)
            + ($verificationBonus * 20)
            + ($budgetFit * 16)
            + ($distanceFit * 14)
            + ($routeFit * 12);
    }

    private function budgetFit(Place $place, string $budgetMode): float
    {
        $max = (float) ($place->average_price_max ?? 0);
        $min = (float) ($place->average_price_min ?? 0);

        return match ($budgetMode) {
            'free' => $max <= 0 ? 1 : 0,
            'low' => $min <= 150 ? 1 : 0.35,
            'medium' => $min <= 400 ? 1 : 0.55,
            default => 1,
        };
    }

    private function routeFit(Place $place, string $routeType, string $vibe): float
    {
        $slug = $place->category?->slug ?? '';
        $matches = [
            'cafe' => ['cafes', 'food', 'hidden-places'],
            'cafe_walk' => ['cafes', 'food', 'parks'],
            'culture' => ['culture', 'museums', 'history', 'architecture'],
            'date' => ['romance', 'cafes', 'photo-spots', 'parks'],
            'family' => ['family', 'parks', 'museums', 'free-places'],
            'friends' => ['hidden-places', 'cafes', 'culture', 'parks'],
            'photo' => ['photo-spots', 'architecture', 'parks'],
            'walk' => ['parks', 'architecture', 'free-places', 'history'],
        ];
        $vibeMatches = [
            'calm' => ['parks', 'museums', 'cafes'],
            'culture' => ['culture', 'museums', 'history', 'architecture'],
            'fun' => ['hidden-places', 'cafes', 'family'],
            'nature' => ['parks', 'free-places'],
            'romantic' => ['romance', 'cafes', 'parks'],
        ];

        $routeScore = in_array($slug, $matches[$routeType] ?? [], true) ? 0.65 : 0.2;
        $vibeScore = in_array($slug, $vibeMatches[$vibe] ?? [], true) ? 0.35 : 0.1;

        return min(1, $routeScore + $vibeScore);
    }

    /**
     * @return array<int, array{variant: string, min: int, max: int, target: int}>
     */
    private function variantConfigs(int $duration): array
    {
        return [
            [
                'max' => 3,
                'min' => 2,
                'target' => $duration <= 120 ? 2 : 3,
                'variant' => 'short',
            ],
            [
                'max' => 5,
                'min' => 3,
                'target' => $duration <= 150 ? 3 : ($duration >= 300 ? 5 : 4),
                'variant' => 'balanced',
            ],
            [
                'max' => 7,
                'min' => 5,
                'target' => $duration >= 300 ? 7 : 5,
                'variant' => 'rich',
            ],
        ];
    }

    /**
     * @param array{variant: string, min: int, max: int, target: int} $config
     * @param Collection<int, array{place: Place, score: float}> $scored
     * @param array<int> $categoryIds
     *
     * @return array<string, mixed>
     */
    private function buildVariant(
        array $config,
        Collection $scored,
        City $city,
        array $input,
        array $categoryIds,
        string $budgetMode,
        string $routeType,
        string $vibe,
    ): array {
        $targetCount = min($config['target'], $scored->count(), $config['max']);
        $targetCount = max(min($targetCount, $scored->count()), min($config['min'], $scored->count()));
        $selected = $this->selectVariantPlaces($scored, $targetCount, $config['variant']);
        $ordered = $this->orderByNearestNeighbor($selected, $city);
        $distance = round($this->routeDistance($ordered), 2);
        $price = $this->routePrice($ordered);
        $duration = $ordered->sum(fn (Place $place) => (int) ($place->visit_duration_minutes ?? 40));
        $places = $ordered->values()->map(function (Place $place, int $index) use ($ordered, $categoryIds, $budgetMode) {
            $previous = $index > 0 ? $ordered[$index - 1] : null;

            return [
                'estimated_duration_minutes' => $place->visit_duration_minutes,
                'order_number' => $index + 1,
                'place' => $this->placePayload($place),
                'place_id' => $place->id,
                'reason' => $this->placeReason($place, $previous, $categoryIds, $budgetMode),
            ];
        });

        return [
            'currency_code' => $city->currency_code,
            'description' => $this->routeDescriptionForVariant($config['variant'], $ordered, $input),
            'distance_km' => $distance,
            'duration_minutes' => $duration,
            'explanation' => $this->variantExplanation($config['variant'], $ordered, $distance, $budgetMode),
            'image_url' => $ordered->first()?->image_url,
            'line' => $ordered->map(fn (Place $place) => [
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
            ])->values()->all(),
            'places' => $places->all(),
            'price_max' => $price['max'],
            'price_min' => $price['min'],
            'route_type' => $routeType,
            'tags' => $this->variantTags($config['variant'], $ordered, $budgetMode, $vibe),
            'title' => $this->routeTitle($input, $config['variant']),
            'tradeoffs' => $this->variantTradeoffs($config['variant'], $ordered),
            'variant' => $config['variant'],
            'vibe' => $vibe,
        ];
    }

    /**
     * @param Collection<int, array{place: Place, score: float}> $scored
     *
     * @return Collection<int, Place>
     */
    private function selectVariantPlaces(Collection $scored, int $targetCount, string $variant): Collection
    {
        $selected = collect();
        $usedCategories = [];
        $strictDiversity = $variant !== 'short';

        foreach ($scored as $candidate) {
            /** @var Place $place */
            $place = $candidate['place'];
            $lastCategory = $selected->last()?->category_id;

            if ($strictDiversity && $lastCategory !== null && $lastCategory === $place->category_id && $selected->count() < $targetCount - 1) {
                continue;
            }

            if ($variant === 'rich' && ($usedCategories[$place->category_id] ?? 0) >= 2) {
                continue;
            }

            $selected->push($place);
            $usedCategories[$place->category_id] = ($usedCategories[$place->category_id] ?? 0) + 1;

            if ($selected->count() >= $targetCount) {
                break;
            }
        }

        if ($selected->count() < $targetCount) {
            $selected = $selected->merge(
                $scored
                    ->pluck('place')
                    ->whereNotIn('id', $selected->pluck('id'))
                    ->take($targetCount - $selected->count()),
            );
        }

        return $selected->take($targetCount)->values();
    }

    /**
     * @param Collection<int, Place> $places
     *
     * @return Collection<int, Place>
     */
    private function orderByNearestNeighbor(Collection $places, City $city): Collection
    {
        $remaining = $places->values();
        $ordered = collect();
        $currentLat = (float) $city->lat;
        $currentLng = (float) $city->lng;

        while ($remaining->isNotEmpty()) {
            $next = $remaining
                ->sortBy(fn (Place $place) => $this->distanceKm($currentLat, $currentLng, (float) $place->lat, (float) $place->lng))
                ->first();

            $ordered->push($next);
            $remaining = $remaining->reject(fn (Place $place) => $place->id === $next->id)->values();
            $currentLat = (float) $next->lat;
            $currentLng = (float) $next->lng;
        }

        return $ordered;
    }

    /**
     * @param Collection<int, Place> $ordered
     */
    private function routeDistance(Collection $ordered): float
    {
        $distance = 0.0;

        for ($i = 1; $i < $ordered->count(); $i++) {
            $previous = $ordered[$i - 1];
            $current = $ordered[$i];
            $distance += $this->distanceKm((float) $previous->lat, (float) $previous->lng, (float) $current->lat, (float) $current->lng);
        }

        return $distance;
    }

    /**
     * @param Collection<int, Place> $ordered
     *
     * @return array{min: float, max: float}
     */
    private function routePrice(Collection $ordered): array
    {
        return [
            'max' => (float) $ordered->sum(fn (Place $place) => (float) ($place->average_price_max ?? 0)),
            'min' => (float) $ordered->sum(fn (Place $place) => (float) ($place->average_price_min ?? 0)),
        ];
    }

    private function distanceKm(float $latA, float $lngA, float $latB, float $lngB): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($latB - $latA);
        $lngDelta = deg2rad($lngB - $lngA);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($latA)) * cos(deg2rad($latB)) * sin($lngDelta / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * @param array<string, mixed> $input
     */
    private function routeTitle(array $input, string $variant): string
    {
        $type = $this->humanize((string) ($input['route_type'] ?? 'walk'));
        $label = match ($variant) {
            'short' => 'Short',
            'rich' => 'Rich',
            default => 'Balanced',
        };

        return $label.' '.$type.' route';
    }

    /**
     * @param Collection<int, Place> $places
     * @param array<string, mixed> $input
     */
    private function routeDescriptionForVariant(string $variant, Collection $places, array $input): string
    {
        $first = $places->first()?->name ?? 'the city center';
        $count = $places->count();
        $type = $this->humanize((string) ($input['route_type'] ?? 'walk'));

        return match ($variant) {
            'short' => "A compact {$type} plan with {$count} stops, starting near {$first}.",
            'rich' => "A fuller {$type} plan with {$count} stops for a more complete city session.",
            default => "A balanced {$type} plan with {$count} stops, useful pace and clear tradeoffs.",
        };
    }

    /**
     * @param array<string, mixed> $variant
     */
    private function routeDescription(array $variant): string
    {
        return (string) ($variant['explanation'] ?? 'Generated CityQuest route preview.');
    }

    /**
     * @param Collection<int, Place> $places
     */
    private function variantExplanation(string $variant, Collection $places, float $distance, string $budgetMode): string
    {
        $categoryCount = $places->pluck('category_id')->unique()->count();

        return match ($variant) {
            'short' => "Shortest option: {$places->count()} close stops, {$categoryCount} categories, about {$distance} km.",
            'rich' => "Rich option: more stops and category variety, still filtered for {$budgetMode} budget fit.",
            default => "Balanced option: useful stop count, category variety and manageable walking distance.",
        };
    }

    /**
     * @param Collection<int, Place> $places
     *
     * @return array<int, string>
     */
    private function variantTradeoffs(string $variant, Collection $places): array
    {
        return match ($variant) {
            'short' => ['Fastest to follow', 'Fewer discoveries than the longer plans'],
            'rich' => ['Most complete city feel', 'Needs more time and energy'],
            default => ['Best default balance', 'Not as quick as short and not as deep as rich'],
        };
    }

    /**
     * @param Collection<int, Place> $places
     *
     * @return array<int, string>
     */
    private function variantTags(string $variant, Collection $places, string $budgetMode, string $vibe): array
    {
        return array_values(array_filter([
            $variant,
            $budgetMode !== 'any' ? $budgetMode : null,
            $vibe !== 'balanced' ? $vibe : null,
            $places->pluck('category_id')->unique()->count() > 2 ? 'diverse' : null,
        ]));
    }

    /**
     * @param array<int> $categoryIds
     */
    private function placeReason(Place $place, ?Place $previous, array $categoryIds, string $budgetMode): string
    {
        $parts = [];

        if ($categoryIds === [] || in_array($place->category_id, $categoryIds, true)) {
            $parts[] = 'matches your interests';
        }

        if ($place->verification_status === Place::STATUS_VERIFIED) {
            $parts[] = 'is verified';
        } elseif ($place->verification_status === Place::STATUS_COMMUNITY_CONFIRMED) {
            $parts[] = 'is community confirmed';
        }

        if ($budgetMode === 'any' || $this->budgetFit($place, $budgetMode) >= 0.9) {
            $parts[] = 'fits the budget';
        }

        if ($previous) {
            $distance = round($this->distanceKm((float) $previous->lat, (float) $previous->lng, (float) $place->lat, (float) $place->lng), 1);
            $parts[] = "is {$distance} km from the previous stop";
        }

        if ($parts === []) {
            $parts[] = 'adds useful variety to the route';
        }

        return ucfirst(implode(', ', $parts)).'.';
    }

    /**
     * @return array<string, mixed>
     */
    private function placePayload(Place $place): array
    {
        return [
            'address' => $place->address,
            'average_price' => [
                'currency_code' => $place->currency_code,
                'max' => $place->average_price_max === null ? null : (float) $place->average_price_max,
                'min' => $place->average_price_min === null ? null : (float) $place->average_price_min,
            ],
            'category' => $place->category ? [
                'color' => $place->category->color,
                'icon' => $place->category->icon,
                'id' => $place->category->id,
                'name' => $place->category->name,
                'places_count' => $place->category->places_count,
                'slug' => $place->category->slug,
            ] : null,
            'city' => $place->city ? [
                'coordinates' => [
                    'lat' => (float) $place->city->lat,
                    'lng' => (float) $place->city->lng,
                ],
                'country' => $place->city->country,
                'currency_code' => $place->city->currency_code,
                'id' => $place->city->id,
                'is_active' => (bool) $place->city->is_active,
                'name' => $place->city->name,
                'slug' => $place->city->slug,
                'timezone' => $place->city->timezone,
            ] : null,
            'coordinates' => [
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
            ],
            'created_at' => $place->created_at?->toISOString(),
            'created_by' => null,
            'description' => $place->description,
            'id' => $place->id,
            'image_url' => $place->image_url,
            'is_active' => (bool) $place->is_active,
            'links' => [
                'external_source' => $place->external_source_url,
                'google_maps' => $place->google_maps_url,
                'official' => $place->official_url,
                'yandex_maps' => $place->yandex_maps_url,
            ],
            'name' => $place->name,
            'photos' => [],
            'short_description' => $place->short_description,
            'slug' => $place->slug,
            'source_type' => $place->source_type,
            'updated_at' => $place->updated_at?->toISOString(),
            'verification_status' => $place->verification_status,
            'visit_duration_minutes' => $place->visit_duration_minutes,
        ];
    }

    private function humanize(string $value): string
    {
        return str_replace(['_', '-'], ' ', Str::lower($value));
    }
}
