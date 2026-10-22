<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class RouteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $points = $this->resource->relationLoaded('points')
            ? $this->points->filter(fn ($point) => $point->place?->isVisibleTo($request->user('sanctum')))->values()
            : collect();

        return [
            'id' => $this->id,
            'city' => new CityResource($this->whenLoaded('city')),
            'author' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'avatar_url' => $this->user?->avatar_url,
                'level' => $this->user?->level,
            ]),
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'route_type' => $this->route_type,
            'vibe' => $this->vibe,
            'duration_minutes' => $this->duration_minutes,
            'distance_km' => $this->distance_km === null ? null : (float) $this->distance_km,
            'budget' => [
                'min' => $this->budget_min === null ? null : (float) $this->budget_min,
                'max' => $this->budget_max === null ? null : (float) $this->budget_max,
                'currency_code' => $this->currency_code,
            ],
            'is_public' => (bool) $this->is_public,
            'likes_count' => (int) $this->likes_count,
            'saves_count' => (int) $this->saves_count,
            'image_url' => $this->image_url,
            'created_source' => $this->created_source,
            'points' => RoutePointResource::collection($this->whenLoaded('points', fn () => $points)),
            'line' => $this->whenLoaded('points', fn () => $this->lineCoordinates($points)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * @return array<int, array{lat: float, lng: float}>
     */
    private function lineCoordinates(Collection $points): array
    {
        return $points
            ->filter(fn ($point) => $point->relationLoaded('place') && $point->place !== null)
            ->map(fn ($point) => [
                'lat' => (float) $point->place->lat,
                'lng' => (float) $point->place->lng,
            ])
            ->values()
            ->all();
    }
}
