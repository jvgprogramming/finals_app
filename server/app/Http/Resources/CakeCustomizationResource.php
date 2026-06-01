<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CakeCustomizationResource extends JsonResource
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
            'dedication_message' => $this->dedication_message,
            'size' => $this->size,
            'flavor' => $this->flavor,
            'color_theme' => $this->color_theme,
            'custom_notes' => $this->custom_notes,
        ];
    }
}
