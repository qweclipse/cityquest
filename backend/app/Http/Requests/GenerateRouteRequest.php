<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateRouteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('duration') && ! $this->has('duration_minutes')) {
            $this->merge(['duration_minutes' => $this->input('duration')]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
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
        ];
    }
}
