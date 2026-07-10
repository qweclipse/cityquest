<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminPlaceController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PlaceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RouteController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'name' => 'CityQuest API',
        'status' => 'ok',
    ]);
});

Route::get('/cities', [CityController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/map/places', [PlaceController::class, 'mapIndex']);
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/{place}', [PlaceController::class, 'show']);
Route::get('/routes/public', [RouteController::class, 'publicIndex']);
Route::get('/routes/{route}', [RouteController::class, 'show']);
Route::post('/routes/preview', [RouteController::class, 'preview'])->middleware('throttle:route-generation');
Route::post('/routes/from-preview', [RouteController::class, 'fromPreview'])->middleware('throttle:route-generation');
Route::post('/routes/generate', [RouteController::class, 'generate'])->middleware('throttle:route-generation');
Route::get('/collections', [CollectionController::class, 'index']);

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:cityquest-auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:cityquest-auth');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    Route::post('/routes/{route}/save', [RouteController::class, 'save']);
    Route::delete('/routes/{route}/save', [RouteController::class, 'unsave']);
    Route::post('/routes/{route}/like', [RouteController::class, 'like']);
    Route::delete('/routes/{route}/like', [RouteController::class, 'unlike']);
    Route::post('/routes/{route}/start', [RouteController::class, 'start']);
    Route::post('/routes/{route}/complete', [RouteController::class, 'complete']);

    Route::post('/places', [PlaceController::class, 'store'])->middleware('throttle:place-submission');
    Route::post('/places/{place}/suggest-correction', [PlaceController::class, 'suggestCorrection'])
        ->middleware('throttle:correction-suggestion');
    Route::post('/places/{place}/favorite', [PlaceController::class, 'favorite']);
    Route::delete('/places/{place}/favorite', [PlaceController::class, 'unfavorite']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
});

Route::middleware(['auth:sanctum', 'role:moderator,admin'])->prefix('admin')->group(function () {
    Route::get('/places/pending', [AdminPlaceController::class, 'pending']);
    Route::get('/places/data-quality', [AdminPlaceController::class, 'dataQuality']);
    Route::patch('/places/{place}/approve', [AdminPlaceController::class, 'approve']);
    Route::patch('/places/{place}/reject', [AdminPlaceController::class, 'reject']);
    Route::patch('/places/{place}/status', [AdminPlaceController::class, 'status']);
});
