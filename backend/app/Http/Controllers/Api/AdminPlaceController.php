<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlaceResource;
use App\Models\ModerationAction;
use App\Models\Place;
use App\Models\PlaceCorrectionSuggestion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminPlaceController extends Controller
{
    public function pending(Request $request): JsonResponse
    {
        $places = Place::query()
            ->with(['city', 'category', 'creator'])
            ->whereIn('verification_status', Place::MODERATION_STATUSES)
            ->latest()
            ->limit(100)
            ->get();

        return response()->json([
            'data' => PlaceResource::collection($places)->resolve($request),
            'meta' => [
                'count' => $places->count(),
            ],
        ]);
    }

    public function dataQuality(Request $request): JsonResponse
    {
        $missingCoordinates = Place::query()
            ->with(['city', 'category', 'creator'])
            ->where(fn (Builder $query) => $this->whereMissingCoordinates($query))
            ->latest()
            ->limit(50)
            ->get();
        $missingSource = Place::query()
            ->with(['city', 'category', 'creator'])
            ->where(fn (Builder $query) => $this->whereMissingSource($query))
            ->latest()
            ->limit(50)
            ->get();
        $missingImages = Place::query()
            ->with(['city', 'category', 'creator'])
            ->whereNull('image_url')
            ->doesntHave('photos')
            ->latest()
            ->limit(50)
            ->get();
        $correctionSuggestions = PlaceCorrectionSuggestion::query()
            ->with(['place.city', 'place.category', 'user'])
            ->where('status', PlaceCorrectionSuggestion::STATUS_PENDING)
            ->latest()
            ->limit(50)
            ->get();
        $duplicateCandidates = $this->duplicateCandidates();

        return response()->json([
            'data' => [
                'correction_suggestions' => $correctionSuggestions
                    ->map(fn (PlaceCorrectionSuggestion $suggestion) => $this->correctionPayload($suggestion))
                    ->values(),
                'duplicate_candidates' => $duplicateCandidates,
                'missing_coordinates' => PlaceResource::collection($missingCoordinates)->resolve($request),
                'missing_images' => PlaceResource::collection($missingImages)->resolve($request),
                'missing_source' => PlaceResource::collection($missingSource)->resolve($request),
            ],
            'meta' => [
                'correction_suggestions_count' => $correctionSuggestions->count(),
                'duplicate_candidates_count' => count($duplicateCandidates),
                'missing_coordinates_count' => $missingCoordinates->count(),
                'missing_images_count' => $missingImages->count(),
                'missing_source_count' => $missingSource->count(),
            ],
        ]);
    }

    public function approve(Request $request, Place $place): PlaceResource
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'string', Rule::in([Place::STATUS_VERIFIED, Place::STATUS_COMMUNITY_CONFIRMED])],
        ]);

        $oldStatus = $place->verification_status;
        $place->forceFill([
            'is_active' => true,
            'verification_status' => $data['status'] ?? Place::STATUS_COMMUNITY_CONFIRMED,
        ])->save();

        $this->logAction($request, $place, 'approve', $oldStatus, $place->verification_status, $data['note'] ?? null);

        return new PlaceResource($place->load(['city', 'category', 'creator', 'photos']));
    }

    public function reject(Request $request, Place $place): PlaceResource
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $oldStatus = $place->verification_status;
        $place->forceFill([
            'is_active' => false,
            'verification_status' => Place::STATUS_REJECTED,
        ])->save();

        $this->logAction($request, $place, 'reject', $oldStatus, $place->verification_status, $data['note'] ?? null);

        return new PlaceResource($place->load(['city', 'category', 'creator', 'photos']));
    }

    public function status(Request $request, Place $place): PlaceResource
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'string', Rule::in(Place::ALL_STATUSES)],
        ]);

        $oldStatus = $place->verification_status;
        $newStatus = $data['status'];
        $place->forceFill([
            'is_active' => $this->statusIsPubliclyActive($newStatus),
            'verification_status' => $newStatus,
        ])->save();

        $this->logAction($request, $place, 'status', $oldStatus, $newStatus, $data['note'] ?? null);

        return new PlaceResource($place->load(['city', 'category', 'creator', 'photos']));
    }

    private function statusIsPubliclyActive(string $status): bool
    {
        return in_array($status, Place::PUBLIC_ACTIVE_STATUSES, true);
    }

    private function logAction(
        Request $request,
        Place $place,
        string $action,
        ?string $oldStatus,
        ?string $newStatus,
        ?string $note,
    ): void {
        ModerationAction::query()->create([
            'action' => $action,
            'entity_id' => $place->id,
            'entity_type' => Place::class,
            'moderator_id' => $request->user()?->id,
            'new_status' => $newStatus,
            'note' => $note,
            'old_status' => $oldStatus,
        ]);
    }

    private function whereMissingCoordinates(Builder $query): void
    {
        $query
            ->whereNull('lat')
            ->orWhereNull('lng')
            ->orWhereNotBetween('lat', [-90, 90])
            ->orWhereNotBetween('lng', [-180, 180])
            ->orWhere('lat', 0)
            ->orWhere('lng', 0);
    }

    private function whereMissingSource(Builder $query): void
    {
        $query
            ->whereNull('official_url')
            ->whereNull('google_maps_url')
            ->whereNull('yandex_maps_url')
            ->whereNull('external_source_url');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function duplicateCandidates(): array
    {
        return DB::table('places')
            ->selectRaw('city_id, LOWER(name) as normalized_name, COUNT(*) as duplicate_count')
            ->groupByRaw('city_id, LOWER(name)')
            ->havingRaw('COUNT(*) > 1')
            ->orderByDesc('duplicate_count')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'city_id' => (int) $row->city_id,
                'count' => (int) $row->duplicate_count,
                'name' => $row->normalized_name,
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function correctionPayload(PlaceCorrectionSuggestion $suggestion): array
    {
        return [
            'id' => $suggestion->id,
            'payload' => $suggestion->payload_json,
            'place' => $suggestion->place ? [
                'id' => $suggestion->place->id,
                'name' => $suggestion->place->name,
                'verification_status' => $suggestion->place->verification_status,
            ] : null,
            'status' => $suggestion->status,
            'submitted_by' => $suggestion->user ? [
                'id' => $suggestion->user->id,
                'name' => $suggestion->user->name,
            ] : null,
            'created_at' => $suggestion->created_at?->toISOString(),
        ];
    }
}
