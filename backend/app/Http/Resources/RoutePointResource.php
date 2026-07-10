<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutePointResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => (int) $this->order_number,
            'estimated_duration_minutes' => $this->estimated_duration_minutes,
            'note' => $this->note,
            'place' => new PlaceResource($this->whenLoaded('place')),
        ];
    }
}
