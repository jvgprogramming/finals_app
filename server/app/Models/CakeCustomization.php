<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CakeCustomization extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'dedication_message',
        'size',
        'flavor',
        'color_theme',
        'custom_notes',
    ];

    /**
     * Get the order item this customization belongs to.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
