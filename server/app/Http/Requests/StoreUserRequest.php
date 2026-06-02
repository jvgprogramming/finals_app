<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix_name' => 'nullable|string|max:255',
            'username' => 'required|string|min:6|max:12|unique:users,username',
            'password' => 'required|string|min:6|max:12|confirmed',
            'password_confirmation' => 'required|string|min:6|max:12',
            'profile_picture' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
        ];
    }
}
