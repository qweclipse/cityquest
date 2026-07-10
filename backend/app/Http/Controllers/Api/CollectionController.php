<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RouteResource;
use App\Models\Route as CityRoute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'tab' => ['nullable', 'string', 'in:popular,new,nearby,following'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = CityRoute::query()
            ->with(['city', 'user', 'points.place.category'])
            ->where('is_public', true)
            ->when($data['city_id'] ?? null, fn (Builder $query, int $cityId) => $query->where('city_id', $cityId));

        match ($data['tab'] ?? 'popular') {
            'new' => $query->orderByDesc('created_at'),
            'nearby' => $query->orderBy('distance_km')->orderByDesc('likes_count'),
            'following' => $query->orderByDesc('saves_count')->orderByDesc('created_at'),
            default => $query->orderByDesc('likes_count')->orderByDesc('saves_count'),
        };

        return RouteResource::collection($query->paginate($data['per_page'] ?? 12));
    }
}
