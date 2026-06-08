<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix_name' => 'nullable|string|max:255',
            'username' => [
                'required',
                'string',
                'min:6',
                'max:12',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'password' => 'nullable|string|min:6|max:12|confirmed',
            'password_confirmation' => 'nullable|string|min:6|max:12',
            'edit_user_profile_picture' => 'nullable|image|mimes:png,jpg,jpeg|max:2048',
        ];
    }
}
