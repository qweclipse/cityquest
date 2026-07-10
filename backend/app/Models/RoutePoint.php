<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoutePoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'place_id',
        'order_number',
        'estimated_duration_minutes',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'order_number' => 'integer',
            'estimated_duration_minutes' => 'integer',
        ];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }
}
