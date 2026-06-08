<?php

namespace App\Http\Requests;

use App\Support\PhoneHelper;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
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
            'notes' => ['sometimes', 'string', 'max:2000'],
            'delivery_date' => ['sometimes', 'date'],
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'customer_phone' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (! PhoneHelper::isValid($value)) {
                        $fail('Please provide a valid Philippine mobile number (e.g., 09171234567).');
                    }
                },
            ],
            'fulfillment_type' => ['sometimes', 'in:pickup,delivery'],
            'delivery_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'delivery_fee' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
