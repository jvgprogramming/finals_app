<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return \Illuminate\Support\Facades\Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.customization' => ['sometimes', 'array'],
            'items.*.customization.dedication_message' => ['sometimes', 'string', 'max:255'],
            'items.*.customization.size' => ['sometimes', 'string', 'max:50'],
            'items.*.customization.flavor' => ['sometimes', 'string', 'max:50'],
            'items.*.customization.color_theme' => ['sometimes', 'string', 'max:50'],
            'items.*.customization.custom_notes' => ['sometimes', 'string'],
            'notes' => ['sometimes', 'string'],
            'delivery_date' => ['sometimes', 'date_format:Y-m-d H:i:s'],
        ];
    }
}
