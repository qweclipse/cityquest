<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Route as CityRoute;
use App\Models\RouteActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ProfileController extends Controller
{
    public function show(Request $request): UserResource
    {
        return new UserResource($this->loadProfile($request->user()));
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->fill($request->validated())->save();

        return new UserResource($this->loadProfile($user));
    }

    private function loadProfile($user)
    {
        $user->load([
            'preferredCity',
            'savedRoutes.city',
            'savedRoutes.points.place.category',
            'favoritePlaces.city',
            'favoritePlaces.category',
            'achievements',
            'createdPlaces.city',
            'createdPlaces.category',
            'routeActivities' => fn ($query) => $query
                ->with(['route.city', 'route.user', 'route.points.place.category'])
                ->latest('updated_at')
                ->limit(8),
        ]);

        $user->loadCount([
            'achievements as achievements_count',
            'createdPlaces as contributions_count',
            'favoritePlaces as favorite_places_count',
            'routeActivities as completed_routes_count' => fn ($query) => $query
                ->where('status', RouteActivity::STATUS_COMPLETED),
            'savedRoutes as saved_routes_count',
        ]);

        $user->setRelation('preferredCategories', $this->preferredCategories($user));
        $user->setRelation('preferredVibes', $this->preferredVibes($user));
        $user->setRelation('suggestedNextRoute', $this->suggestedNextRoute($user));

        return $user;
    }

    /**
     * @return Collection<int, \App\Models\Category>
     */
    private function preferredCategories($user): Collection
    {
        $categories = collect();

        $user->favoritePlaces
            ->pluck('category')
            ->filter()
            ->each(fn ($category) => $categories->push($category));

        $user->savedRoutes
            ->flatMap(fn ($route) => $route->points)
            ->pluck('place.category')
            ->filter()
            ->each(fn ($category) => $categories->push($category));

        return $categories
            ->groupBy('id')
            ->sortByDesc(fn ($group) => $group->count())
            ->map(fn ($group) => $group->first())
            ->take(4)
            ->values();
    }

    /**
     * @return Collection<int, string>
     */
    private function preferredVibes($user): Collection
    {
        return $user->savedRoutes
            ->merge($user->routeActivities->pluck('route')->filter())
            ->flatMap(fn ($route) => array_filter([$route->route_type, $route->vibe]))
            ->countBy()
            ->sortDesc()
            ->keys()
            ->take(5)
            ->values();
    }

    private function suggestedNextRoute($user): ?CityRoute
    {
        $completedRouteIds = $user->routeActivities()
            ->where('status', RouteActivity::STATUS_COMPLETED)
            ->pluck('route_id');

        $savedSuggestion = $user->savedRoutes
            ->first(fn ($route) => ! $completedRouteIds->contains($route->id));

        if ($savedSuggestion) {
            return $savedSuggestion->loadMissing(['city', 'user', 'points.place.category']);
        }

        return CityRoute::query()
            ->with(['city', 'user', 'points.place.category'])
            ->where('is_public', true)
            ->when($user->preferred_city_id, fn ($query) => $query->where('city_id', $user->preferred_city_id))
            ->whereNotIn('id', $completedRouteIds)
            ->orderByDesc('saves_count')
            ->orderByDesc('likes_count')
            ->first();
    }
}
