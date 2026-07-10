<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'preferred_city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'preferred_language' => ['nullable', 'string', 'in:ru,en,ro'],
            'preferred_theme' => ['nullable', 'string', 'in:light,dark,system'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}
