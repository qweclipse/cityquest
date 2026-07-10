<?php

namespace App\Http\Resources;

use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'avatar_url' => $this->avatar_url,
            'preferred_language' => $this->preferred_language,
            'preferred_theme' => $this->preferred_theme,
            'level' => (int) $this->level,
            'preferred_city' => new CityResource($this->whenLoaded('preferredCity')),
            'achievements' => AchievementResource::collection($this->whenLoaded('achievements')),
            'saved_routes' => RouteResource::collection($this->whenLoaded('savedRoutes')),
            'favorite_places' => PlaceResource::collection($this->whenLoaded('favoritePlaces')),
            'stats' => $this->when($this->profileStatsAvailable(), fn () => [
                'achievements_count' => (int) ($this->achievements_count ?? $this->loadedCount('achievements')),
                'completed_routes_count' => (int) ($this->completed_routes_count ?? 0),
                'contributions_count' => (int) ($this->contributions_count ?? $this->loadedCount('createdPlaces')),
                'favorite_places_count' => (int) ($this->favorite_places_count ?? $this->loadedCount('favoritePlaces')),
                'saved_routes_count' => (int) ($this->saved_routes_count ?? $this->loadedCount('savedRoutes')),
            ]),
            'recent_route_activity' => RouteActivityResource::collection($this->whenLoaded('routeActivities')),
            'suggested_next_route' => $this->when(
                $this->relationLoaded('suggestedNextRoute') && $this->suggestedNextRoute,
                fn () => new RouteResource($this->suggestedNextRoute),
                null,
            ),
            'preferred_categories' => CategoryResource::collection($this->whenLoaded('preferredCategories')),
            'preferred_vibes' => $this->when(
                $this->relationLoaded('preferredVibes'),
                fn () => $this->preferredVibes->values()->all(),
                [],
            ),
            'contribution_status' => $this->whenLoaded('createdPlaces', fn () => $this->contributionStatus()),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function profileStatsAvailable(): bool
    {
        return $this->relationLoaded('savedRoutes')
            || $this->relationLoaded('favoritePlaces')
            || $this->relationLoaded('routeActivities')
            || $this->relationLoaded('createdPlaces');
    }

    private function loadedCount(string $relation): int
    {
        return $this->relationLoaded($relation) ? $this->{$relation}->count() : 0;
    }

    /**
     * @return array<string, mixed>
     */
    private function contributionStatus(): array
    {
        $places = $this->createdPlaces;
        $lastPlace = $places->sortByDesc('updated_at')->first();
        $approvedStatuses = [
            Place::STATUS_VERIFIED,
            Place::STATUS_COMMUNITY_CONFIRMED,
        ];

        return [
            'total' => $places->count(),
            'pending' => $places->whereIn('verification_status', Place::MODERATION_STATUSES)->count(),
            'approved' => $places->whereIn('verification_status', $approvedStatuses)->count(),
            'rejected' => $places->where('verification_status', Place::STATUS_REJECTED)->count(),
            'last_status' => $lastPlace?->verification_status,
            'last_place_name' => $lastPlace?->name,
        ];
    }
}
