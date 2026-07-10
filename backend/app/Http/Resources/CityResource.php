<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'country' => $this->country,
            'name' => $this->name,
            'slug' => $this->slug,
            'coordinates' => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
            'timezone' => $this->timezone,
            'currency_code' => $this->currency_code,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
