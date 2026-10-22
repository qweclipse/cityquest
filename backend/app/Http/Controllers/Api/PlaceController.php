<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlaceRequest;
use App\Http\Resources\PlaceResource;
use App\Models\ModerationAction;
use App\Models\Place;
use App\Models\PlaceCorrectionSuggestion;
use App\Support\UniqueSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PlaceController extends Controller
{
    private const MAP_STATUS_FILTERS = [
        'verified' => [Place::STATUS_VERIFIED],
        'community' => [Place::STATUS_VERIFIED, Place::STATUS_COMMUNITY_CONFIRMED],
        'all' => Place::PUBLIC_ACTIVE_STATUSES,
    ];

    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:120'],
            'verification_status' => ['nullable', 'string', 'in:'.implode(',', Place::ALL_STATUSES)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = Place::query()
            ->with(['city', 'category'])
            ->where('is_active', true)
            ->when($data['city_id'] ?? null, fn (Builder $query, int $cityId) => $query->where('city_id', $cityId))
            ->when($data['category_id'] ?? null, fn (Builder $query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($data['verification_status'] ?? null, fn (Builder $query, string $status) => $query->where('verification_status', $status))
            ->when($data['search'] ?? null, function (Builder $query, string $search) {
                $query->where(function (Builder $query) use ($search) {
                    $term = '%'.mb_strtolower($search).'%';

                    $query->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(short_description) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(address) LIKE ?', [$term]);
                });
            })
            ->orderBy('name');

        return PlaceResource::collection($query->paginate($data['per_page'] ?? 24));
    }

    public function mapIndex(Request $request): JsonResponse
    {
        $data = $request->validate([
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status_filter' => ['nullable', 'string', 'in:verified,community,all'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:500'],
        ]);

        $cityId = $data['city_id'] ?? null;
        $categoryId = $data['category_id'] ?? null;
        $statusFilter = $data['status_filter'] ?? 'community';
        $statuses = self::MAP_STATUS_FILTERS[$statusFilter];
        $perPage = (int) ($data['per_page'] ?? 250);

        $baseQuery = $this->mapBaseQuery($cityId);
        $selectedQuery = (clone $baseQuery)
            ->when($categoryId, fn (Builder $query, int $categoryId) => $query->where('category_id', $categoryId));
        $filteredQuery = (clone $selectedQuery)->whereIn('verification_status', $statuses);
        $filteredCount = (clone $filteredQuery)->count();
        $places = (clone $filteredQuery)
            ->with(['city', 'category'])
            ->orderBy('name')
            ->limit($perPage)
            ->get();
        $visibleCount = $places->count();
        $mappableCount = $places->filter(fn (Place $place) => $this->hasMapCoordinates($place))->count();
        $unmappableCount = (clone $filteredQuery)
            ->where(fn (Builder $query) => $this->whereMissingMapCoordinates($query))
            ->count();
        $totalCount = (clone $selectedQuery)->count();

        return response()->json([
            'places' => PlaceResource::collection($places)->resolve($request),
            'meta' => [
                'total_count' => $totalCount,
                'filtered_count' => $filteredCount,
                'visible_count' => $visibleCount,
                'mappable_count' => $mappableCount,
                'unmappable_count' => $unmappableCount,
                'hidden_by_status_count' => max(0, $totalCount - $filteredCount),
                'hidden_by_pagination_count' => max(0, $filteredCount - $visibleCount),
                'status_filter' => $statusFilter,
                'per_page' => $perPage,
                'category_counts' => [
                    'all' => $this->categoryCounts((clone $baseQuery)),
                    'visible' => $this->categoryCounts((clone $baseQuery)->whereIn('verification_status', $statuses)),
                    'mappable' => $this->categoryCounts(
                        $this->whereMappableCoordinates(
                            (clone $baseQuery)->whereIn('verification_status', $statuses),
                        ),
                    ),
                ],
            ],
        ]);
    }

    public function show(Request $request, Place $place): PlaceResource
    {
        $this->ensureVisible($request, $place);

        return new PlaceResource(
            $place->load(['city', 'category', 'creator', 'photos']),
        );
    }

    public function store(StorePlaceRequest $request): JsonResponse
    {
        $data = $request->validated();

        $place = Place::query()->create([
            ...$data,
            'created_by_user_id' => $request->user()->id,
            'slug' => UniqueSlug::make(
                Place::class,
                $data['name'],
                fn (Builder $query) => $query->where('city_id', $data['city_id']),
            ),
            'currency_code' => $data['currency_code'] ?? 'MDL',
            'verification_status' => $this->initialModerationStatus($data),
            'source_type' => Place::SOURCE_COMMUNITY,
            'is_active' => false,
        ]);

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement(
                'UPDATE places SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography WHERE id = ?',
                [$place->id],
            );
        }

        ModerationAction::query()->create([
            'action' => 'submitted',
            'entity_id' => $place->id,
            'entity_type' => Place::class,
            'moderator_id' => null,
            'new_status' => $place->verification_status,
            'note' => 'Community place submitted for moderation.',
            'old_status' => null,
        ]);

        return (new PlaceResource($place->load(['city', 'category', 'creator', 'photos'])))
            ->response()
            ->setStatusCode(201);
    }

    public function suggestCorrection(Request $request, Place $place): JsonResponse
    {
        $this->ensureVisible($request, $place);

        $data = $request->validate([
            'payload' => ['required', 'array'],
            'payload.address' => ['nullable', 'string', 'max:255'],
            'payload.average_price_max' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'payload.average_price_min' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'payload.google_maps_url' => ['nullable', 'url', 'max:2048'],
            'payload.image_url' => ['nullable', 'url', 'max:2048'],
            'payload.name' => ['nullable', 'string', 'max:255'],
            'payload.note' => ['required', 'string', 'max:2000'],
            'payload.official_url' => ['nullable', 'url', 'max:2048'],
            'payload.reason' => ['required', 'string', 'in:name_address,price,source_link,image_link,status_issue,place_closed'],
            'payload.status_issue' => ['nullable', 'string', 'max:255'],
        ]);

        $suggestion = PlaceCorrectionSuggestion::query()->create([
            'payload_json' => $data['payload'],
            'place_id' => $place->id,
            'status' => PlaceCorrectionSuggestion::STATUS_PENDING,
            'user_id' => $request->user()->id,
        ]);

        ModerationAction::query()->create([
            'action' => 'correction_suggested',
            'entity_id' => $place->id,
            'entity_type' => Place::class,
            'moderator_id' => null,
            'new_status' => $place->verification_status,
            'note' => $data['payload']['note'],
            'old_status' => $place->verification_status,
        ]);

        return response()->json([
            'data' => [
                'id' => $suggestion->id,
                'status' => $suggestion->status,
            ],
        ], 201);
    }

    public function favorite(Request $request, Place $place): PlaceResource
    {
        $this->ensureVisible($request, $place);

        $request->user()->favoritePlaces()->syncWithoutDetaching([$place->id]);

        return new PlaceResource($place->load(['city', 'category']));
    }

    public function unfavorite(Request $request, Place $place): PlaceResource
    {
        $this->ensureVisible($request, $place);

        $request->user()->favoritePlaces()->detach($place->id);

        return new PlaceResource($place->load(['city', 'category']));
    }

    private function ensureVisible(Request $request, Place $place): void
    {
        abort_unless($place->isVisibleTo($request->user('sanctum')), 404);
    }

    private function mapBaseQuery(?int $cityId): Builder
    {
        return Place::query()
            ->where('is_active', true)
            ->when($cityId, fn (Builder $query, int $cityId) => $query->where('city_id', $cityId));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function initialModerationStatus(array $data): string
    {
        if (! $this->coordinatesLookReviewable($data)) {
            return Place::STATUS_NEEDS_LOCATION_REVIEW;
        }

        if (! $this->hasAnySourceLink($data)) {
            return Place::STATUS_NEEDS_SOURCE_REVIEW;
        }

        if (! filled($data['image_url'] ?? null)) {
            return Place::STATUS_NEEDS_IMAGE_REVIEW;
        }

        return Place::STATUS_NEEDS_REVIEW;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function coordinatesLookReviewable(array $data): bool
    {
        $lat = (float) ($data['lat'] ?? 0);
        $lng = (float) ($data['lng'] ?? 0);

        return $lat !== 0.0 && $lng !== 0.0;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function hasAnySourceLink(array $data): bool
    {
        return filled($data['official_url'] ?? null)
            || filled($data['google_maps_url'] ?? null)
            || filled($data['yandex_maps_url'] ?? null)
            || filled($data['external_source_url'] ?? null);
    }

    /**
     * @return array<int|string, int>
     */
    private function categoryCounts(Builder $query): array
    {
        return $query
            ->select('category_id', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('category_id')
            ->pluck('aggregate', 'category_id')
            ->map(fn ($count) => (int) $count)
            ->all();
    }

    private function whereMappableCoordinates(Builder $query): Builder
    {
        return $query
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->whereBetween('lat', [-90, 90])
            ->whereBetween('lng', [-180, 180])
            ->where('lat', '!=', 0)
            ->where('lng', '!=', 0);
    }

    private function whereMissingMapCoordinates(Builder $query): void
    {
        $query
            ->whereNull('lat')
            ->orWhereNull('lng')
            ->orWhereNotBetween('lat', [-90, 90])
            ->orWhereNotBetween('lng', [-180, 180])
            ->orWhere('lat', 0)
            ->orWhere('lng', 0);
    }

    private function hasMapCoordinates(Place $place): bool
    {
        $lat = (float) $place->lat;
        $lng = (float) $place->lng;

        return $lat !== 0.0
            && $lng !== 0.0
            && $lat >= -90
            && $lat <= 90
            && $lng >= -180
            && $lng <= 180;
    }
}
