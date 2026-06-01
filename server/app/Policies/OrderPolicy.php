<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can accept the order.
     */
    public function accept(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can decline the order.
     */
    public function decline(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
