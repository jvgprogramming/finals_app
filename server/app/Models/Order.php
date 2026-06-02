<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'fulfillment_type',
        'delivery_address',
        'order_number',
        'total_amount',
        'delivery_fee',
        'status',
        'notes',
        'delivery_date',
        'payment_method',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'delivery_date' => 'datetime',
    ];

    /**
     * Get the user that owns this order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all items in this order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all notifications for this order.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Calculate and update total amount from order items.
     */
    public function calculateTotal(): void
    {
        $this->total_amount = $this->orderItems()->sum(function ($item) {
            return $item->product_price_snapshot * $item->quantity;
        });
        $this->save();
    }
}
