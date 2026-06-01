<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'product_name_snapshot' => $this->product_name_snapshot,
            'product_price_snapshot' => (float) $this->product_price_snapshot,
            'quantity' => $this->quantity,
            'customization' => new CakeCustomizationResource($this->whenLoaded('customization')),
        ];
    }
}
