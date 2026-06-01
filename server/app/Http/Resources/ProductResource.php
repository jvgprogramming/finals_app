<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => $this->stock,
            'is_available' => $this->is_available,
            'image_url' => $this->image_path
                ? url(Storage::url('products/' . $this->image_path))
                : null,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_id' => $this->category_id,
        ];
    }
}
