<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'average_price_min' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'average_price_max' => ['nullable', 'numeric', 'min:0', 'max:999999.99', 'gte:average_price_min'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'visit_duration_minutes' => ['nullable', 'integer', 'min:5', 'max:600'],
            'official_url' => ['nullable', 'url', 'max:2048'],
            'google_maps_url' => ['nullable', 'url', 'max:2048'],
            'yandex_maps_url' => ['nullable', 'url', 'max:2048'],
            'external_source_url' => ['nullable', 'url', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
