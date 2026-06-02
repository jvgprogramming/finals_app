<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'total_amount' => (float) $this->total_amount,
            'delivery_fee' => (float) ($this->delivery_fee ?? 0),
            'status' => $this->status,
            'notes' => $this->notes,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'fulfillment_type' => $this->fulfillment_type ?? 'pickup',
            'delivery_address' => $this->delivery_address,
            'delivery_date' => $this->delivery_date,
            'payment_method' => $this->payment_method ?? 'Cash on Delivery',
            'user' => new UserResource($this->whenLoaded('user')),
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
