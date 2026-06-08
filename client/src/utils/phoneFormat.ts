/**
 * Philippine phone number formatting and validation utilities.
 *
 * User enters: 09171234567
 * Displayed as: +63 917 123 4567
 * Stored/sent as: +639171234567
 */

/**
 * Strip all non-digit characters from a phone string (keep leading +).
 */
function stripNonDigits(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '');
  // Only allow at most one leading +
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/\+/g, '');
  }
  return cleaned;
}

/**
 * Normalize phone to E.164 format (+639XXXXXXXXX).
 */
export function normalizePhone(phone: string): string {
  const cleaned = stripNonDigits(phone);

  if (cleaned.startsWith('+63')) {
    return cleaned;
  }

  if (cleaned.startsWith('63')) {
    return '+' + cleaned;
  }

  if (cleaned.startsWith('0')) {
    return '+63' + cleaned.slice(1);
  }

  return '+63' + cleaned;
}

/**
 * Validate a Philippine mobile number.
 * Must be +63 + 10 digits (exactly 13 chars) and start with +639 (mobile prefix).
 * e.g., +639171234567
 */
export function isValidPhilippinePhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // +63 followed by exactly 10 digits = 13 chars total
  if (!/^\+63\d{10}$/.test(normalized)) return false;
  // Philippine mobile numbers start with +639 (the 09 prefix)
  return normalized.startsWith('+639');
}

/**
 * Format for display: +63 917 123 4567
 * Returns empty string for invalid input.
 */
export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  const match = normalized.match(/^\+63(\d{3})(\d{3})(\d{4})$/);
  if (!match) return phone;
  return `+63 ${match[1]} ${match[2]} ${match[3]}`;
}

/**
 * Format phone for a text input while the user is typing.
 * Shows the raw number with +63 prefix as they type.
 */
export function formatPhoneInput(value: string): string {
  // If empty, start with +63
  if (!value) return '+63 ';

  const cleaned = value.replace(/[^\d]/g, '');

  // Remove leading zeros or 63 prefix since we'll add +63
  let digits = cleaned;
  if (digits.startsWith('63')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Limit to 10 digits (after +63)
  digits = digits.slice(0, 10);

  // Format as +63 XXX XXX XXXX
  const parts: string[] = ['+63'];
  if (digits.length > 0) {
    parts.push(digits.slice(0, 3));
  }
  if (digits.length > 3) {
    parts.push(digits.slice(3, 6));
  }
  if (digits.length > 6) {
    parts.push(digits.slice(6, 10));
  }

  return parts.join(' ');
}
