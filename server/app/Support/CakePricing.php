<?php

namespace App\Support;

class CakePricing
{
    /** @var array<string, float> */
    private const CAKE_MULTIPLIERS = [
        '6" Personal' => 1.0,
        '8" Celebration' => 1.35,
        '10" Grand' => 1.75,
    ];

    /** @var array<string, float> Pastry/bread tiers; base price is 6 pcs. */
    private const PASTRY_MULTIPLIERS = [
        '6 pcs' => 1.0,
        'One Dozen' => 1.9,
        'Party Tray (24 pcs)' => 3.6,
    ];

    public static function priceForSize(float $basePrice, ?string $size): float
    {
        if ($size === null || $size === '') {
            return round($basePrice, 2);
        }

        $multiplier = self::CAKE_MULTIPLIERS[$size]
            ?? self::PASTRY_MULTIPLIERS[$size]
            ?? 1.0;

        return round($basePrice * $multiplier, 2);
    }
}
