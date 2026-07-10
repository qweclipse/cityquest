<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return NotificationResource::collection(
            $request->user()
                ->notifications()
                ->latest()
                ->paginate($request->integer('per_page', 20)),
        );
    }

    public function markAsRead(Request $request, Notification $notification): NotificationResource
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        $notification->forceFill(['read_at' => now()])->save();

        return new NotificationResource($notification);
    }
}
