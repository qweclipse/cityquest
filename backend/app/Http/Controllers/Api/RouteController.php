<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateRouteRequest;
use App\Http\Resources\RouteActivityResource;
use App\Http\Resources\RouteResource;
use App\Models\Achievement;
use App\Models\Notification;
use App\Models\Route as CityRoute;
use App\Models\RouteActivity;
use App\Services\RouteGenerationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class RouteController extends Controller
{
    public function publicIndex(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'route_type' => ['nullable', 'string', 'max:50'],
            'vibe' => ['nullable', 'string', 'max:50'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = CityRoute::query()
            ->with(['city', 'user', 'points.place.category'])
            ->where('is_public', true)
            ->when($data['city_id'] ?? null, fn (Builder $query, int $cityId) => $query->where('city_id', $cityId))
            ->when($data['route_type'] ?? null, fn (Builder $query, string $routeType) => $query->where('route_type', $routeType))
            ->when($data['vibe'] ?? null, fn (Builder $query, string $vibe) => $query->where('vibe', $vibe))
            ->orderByDesc('likes_count')
            ->orderByDesc('created_at');

        return RouteResource::collection($query->paginate($data['per_page'] ?? 12));
    }

    public function show(CityRoute $route): RouteResource
    {
        return new RouteResource(
            $route->load(['city', 'user', 'points.place.city', 'points.place.category']),
        );
    }

    public function generate(GenerateRouteRequest $request, RouteGenerationService $service): JsonResponse
    {
        $route = $service->generate($request->validated());

        return (new RouteResource($route))
            ->response()
            ->setStatusCode(201);
    }

    public function preview(GenerateRouteRequest $request, RouteGenerationService $service): JsonResponse
    {
        return response()->json([
            'data' => $service->preview($request->validated()),
        ]);
    }

    public function fromPreview(Request $request, RouteGenerationService $service): JsonResponse
    {
        $data = $request->validate([
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'date' => ['nullable', 'date'],
            'preferred_day' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:60', 'max:480'],
            'route_type' => ['nullable', 'string', 'max:50'],
            'vibe' => ['nullable', 'string', 'max:50'],
            'category_ids' => ['nullable', 'array', 'max:12'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'interests' => ['nullable', 'array', 'max:12'],
            'interests.*' => ['string', 'max:80'],
            'budget_mode' => ['nullable', 'string', 'in:free,low,medium,any'],
            'place_mode' => ['nullable', 'string', 'in:verified_only,include_community'],
            'preview' => ['required', 'array'],
            'preview.variant' => ['required', 'string', 'in:short,balanced,rich'],
            'preview.title' => ['required', 'string', 'max:255'],
            'preview.description' => ['nullable', 'string', 'max:5000'],
            'preview.explanation' => ['nullable', 'string', 'max:5000'],
            'preview.duration_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'preview.distance_km' => ['required', 'numeric', 'min:0', 'max:999'],
            'preview.price_min' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'preview.price_max' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'preview.places' => ['required', 'array', 'min:2', 'max:7'],
            'preview.places.*.place_id' => ['required', 'integer', 'exists:places,id'],
            'preview.places.*.order_number' => ['required', 'integer', 'min:1', 'max:7'],
            'preview.places.*.reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $route = $service->persistPreview($data, $data['preview'], $request->user()?->id);

        return (new RouteResource($route))
            ->response()
            ->setStatusCode(201);
    }

    public function save(Request $request, CityRoute $route): RouteResource
    {
        $request->user()->savedRoutes()->syncWithoutDetaching([$route->id]);
        $route->forceFill(['saves_count' => $route->savedByUsers()->count()])->save();

        return new RouteResource($route->load(['city', 'user', 'points.place.category']));
    }

    public function unsave(Request $request, CityRoute $route): RouteResource
    {
        $request->user()->savedRoutes()->detach($route->id);
        $route->forceFill(['saves_count' => $route->savedByUsers()->count()])->save();

        return new RouteResource($route->load(['city', 'user', 'points.place.category']));
    }

    public function like(Request $request, CityRoute $route): RouteResource
    {
        $request->user()->likedRoutes()->syncWithoutDetaching([$route->id]);
        $route->forceFill(['likes_count' => $route->likedByUsers()->count()])->save();

        return new RouteResource($route->load(['city', 'user', 'points.place.category']));
    }

    public function unlike(Request $request, CityRoute $route): RouteResource
    {
        $request->user()->likedRoutes()->detach($route->id);
        $route->forceFill(['likes_count' => $route->likedByUsers()->count()])->save();

        return new RouteResource($route->load(['city', 'user', 'points.place.category']));
    }

    public function start(Request $request, CityRoute $route): JsonResponse
    {
        $activity = RouteActivity::query()->firstOrNew([
            'route_id' => $route->id,
            'user_id' => $request->user()->id,
        ]);

        if ($activity->status !== RouteActivity::STATUS_COMPLETED) {
            $activity->fill([
                'status' => RouteActivity::STATUS_STARTED,
                'started_at' => $activity->started_at ?? now(),
            ])->save();
        }

        return (new RouteActivityResource($activity->load($this->activityRouteRelations())))
            ->response()
            ->setStatusCode(200);
    }

    public function complete(Request $request, CityRoute $route): JsonResponse
    {
        $user = $request->user();

        $activity = DB::transaction(function () use ($route, $user) {
            $activity = RouteActivity::query()
                ->lockForUpdate()
                ->firstOrNew([
                    'route_id' => $route->id,
                    'user_id' => $user->id,
                ]);
            $wasCompleted = $activity->exists && $activity->status === RouteActivity::STATUS_COMPLETED;
            $now = now();

            $activity->fill([
                'status' => RouteActivity::STATUS_COMPLETED,
                'started_at' => $activity->started_at ?? $now,
                'completed_at' => $activity->completed_at ?? $now,
            ])->save();

            $user->savedRoutes()->syncWithoutDetaching([$route->id]);
            $route->forceFill(['saves_count' => $route->savedByUsers()->count()])->save();

            if (! $wasCompleted) {
                Notification::query()->create([
                    'user_id' => $user->id,
                    'title' => 'Route completed',
                    'body' => 'Your walk "'.$route->title.'" is now saved in your history.',
                    'type' => 'route',
                ]);

                $this->unlockFirstRouteAchievement($user);
            }

            return $activity;
        });

        return (new RouteActivityResource($activity->load($this->activityRouteRelations())))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * @return array<int, string>
     */
    private function activityRouteRelations(): array
    {
        return ['route.city', 'route.user', 'route.points.place.category'];
    }

    private function unlockFirstRouteAchievement($user): void
    {
        $achievement = Achievement::query()
            ->where('code', 'urban-walker')
            ->first();

        if (! $achievement || $user->achievements()->whereKey($achievement->id)->exists()) {
            return;
        }

        $user->achievements()->attach($achievement->id, ['unlocked_at' => now()]);

        Notification::query()->create([
            'user_id' => $user->id,
            'title' => 'Achievement unlocked',
            'body' => 'You unlocked Urban Walker by completing a route.',
            'type' => 'achievement',
        ]);
    }
}
