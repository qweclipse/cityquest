<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'country',
        'name',
        'slug',
        'lat',
        'lng',
        'timezone',
        'currency_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function places(): HasMany
    {
        return $this->hasMany(Place::class);
    }

    public function routes(): HasMany
    {
        return $this->hasMany(Route::class);
    }
}
