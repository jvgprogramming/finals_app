String normalizePhone(String phone) {
  final cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
  if (cleaned.startsWith('+63')) return cleaned;
  if (cleaned.startsWith('63')) return '+$cleaned';
  if (cleaned.startsWith('0')) return '+63${cleaned.substring(1)}';
  return '+63$cleaned';
}

bool isValidPhilippinePhone(String phone) {
  final normalized = normalizePhone(phone);
  if (!RegExp(r'^\+63\d{10}$').hasMatch(normalized)) return false;
  return normalized.startsWith('+639');
}

String formatPhoneInput(String value) {
  if (value.isEmpty) return '+63 ';
  final cleaned = value.replaceAll(RegExp(r'[^\d]'), '');
  String digits = cleaned;
  if (digits.startsWith('63')) {
    digits = digits.substring(2);
  } else if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  digits = digits.length > 10 ? digits.substring(0, 10) : digits;
  final parts = <String>['+63'];
  if (digits.isNotEmpty) parts.add(digits.substring(0, digits.length > 3 ? 3 : digits.length));
  if (digits.length > 3) parts.add(digits.substring(3, digits.length > 6 ? 6 : digits.length));
  if (digits.length > 6) parts.add(digits.substring(6, digits.length > 10 ? 10 : digits.length));
  return parts.join(' ');
}
