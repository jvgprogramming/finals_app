<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
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
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'name' => $this->product?->name ?? 'Unknown',
            'price' => (float) $this->price,
            'quantity' => $this->quantity,
            'size' => $this->size,
            'dedication' => $this->dedication,
            'image' => $this->product?->image_path
                ? url(\Illuminate\Support\Facades\Storage::url('products/'.$this->product->image_path))
                : '/images/placeholder.png',
            'product' => new ProductResource($this->whenLoaded('product')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
