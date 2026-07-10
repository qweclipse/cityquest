<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'city' => new CityResource($this->whenLoaded('city')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_by' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator?->id,
                'name' => $this->creator?->name,
                'avatar_url' => $this->creator?->avatar_url,
                'level' => $this->creator?->level,
            ]),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'address' => $this->address,
            'coordinates' => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            'average_price' => [
                'min' => $this->average_price_min === null ? null : (float) $this->average_price_min,
                'max' => $this->average_price_max === null ? null : (float) $this->average_price_max,
                'currency_code' => $this->currency_code,
            ],
            'visit_duration_minutes' => $this->visit_duration_minutes,
            'verification_status' => $this->verification_status,
            'source_type' => $this->source_type,
            'links' => [
                'official' => $this->official_url,
                'google_maps' => $this->google_maps_url,
                'yandex_maps' => $this->yandex_maps_url,
                'external_source' => $this->external_source_url,
            ],
            'image_url' => $this->image_url,
            'photos' => $this->whenLoaded('photos', fn () => $this->photos->map(fn ($photo) => [
                'id' => $photo->id,
                'image_url' => $photo->image_url,
                'source' => $photo->source,
            ])->values()),
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
