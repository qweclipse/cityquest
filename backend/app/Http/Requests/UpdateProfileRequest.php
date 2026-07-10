<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'preferred_city_id' => ['sometimes', 'nullable', 'integer', 'exists:cities,id'],
            'preferred_language' => ['sometimes', 'string', 'in:ru,en,ro'],
            'preferred_theme' => ['sometimes', 'string', 'in:light,dark,system'],
        ];
    }
}
