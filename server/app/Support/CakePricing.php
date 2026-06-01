<?php

namespace App\Support;

class CakePricing
{
    /** @var array<string, float> */
    private const MULTIPLIERS = [
        '6" Personal' => 1.0,
        '8" Celebration' => 1.35,
        '10" Grand' => 1.75,
    ];

    public static function priceForSize(float $basePrice, ?string $size): float
    {
        if ($size === null || $size === '') {
            return round($basePrice, 2);
        }

        $multiplier = self::MULTIPLIERS[$size] ?? 1.0;

        return round($basePrice * $multiplier, 2);
    }
}
