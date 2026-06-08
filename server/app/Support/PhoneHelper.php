<?php

namespace App\Support;

/**
 * Helper for Philippine phone number formatting and validation.
 *
 * Philippine mobile numbers: 0917XXXXXXX (11 digits starting with 0)
 * Stored format: +63917XXXXXXX (E.164 format with +63)
 * Display format: +63 917 XXX XXXX
 */
class PhoneHelper
{
    /**
     * Normalize a Philippine phone number to E.164 format (+639XXXXXXXXX).
     *
     * Accepts:
     * - 09171234567 (local format)
     * - 9171234567 (without leading 0)
     * - +639171234567 (already E.164)
     * - 639171234567 (E.164 without +)
     */
    public static function normalize(string $phone): string
    {
        // Strip everything except digits and leading +
        $cleaned = preg_replace('/[^\d+]/', '', $phone);

        // If it starts with +63, keep as is
        if (str_starts_with($cleaned, '+63')) {
            return $cleaned;
        }

        // If it starts with 63 (without +), prepend +
        if (str_starts_with($cleaned, '63')) {
            return '+'.$cleaned;
        }

        // If it starts with 0, replace 0 with +63
        if (str_starts_with($cleaned, '0')) {
            return '+63'.substr($cleaned, 1);
        }

        // Assume it's a raw number without prefix, prepend +63
        return '+63'.$cleaned;
    }

    /**
     * Validate a Philippine mobile number.
     *
     * Valid formats after normalization:
     * - +639XX XXX XXXX (where XX is any valid network prefix)
     * - Must be exactly 13 characters including +63
     * - Must start with +639
     */
    public static function isValid(string $phone): bool
    {
        $normalized = self::normalize($phone);

        // E.164 format: +63 followed by exactly 10 digits (total 13 chars)
        if (! preg_match('/^\+63\d{10}$/', $normalized)) {
            return false;
        }

        // Philippine mobile numbers start with +639 (09 prefix)
        // Valid prefixes: 09[0-9]{9} → +639[0-9]{9}
        // This covers all Globe, Smart, Sun, DITO prefixes
        return str_starts_with($normalized, '+639');
    }

    /**
     * Format a phone number for display.
     * e.g., +639171234567 → +63 917 123 4567
     */
    public static function formatDisplay(string $phone): string
    {
        $normalized = self::normalize($phone);

        if (! preg_match('/^\+63(\d{3})(\d{3})(\d{4})$/', $normalized, $m)) {
            return $phone; // Return original if it doesn't match expected format
        }

        return '+63 '.$m[1].' '.$m[2].' '.$m[3];
    }
}
