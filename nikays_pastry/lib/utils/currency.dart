String formatPeso(double amount) {
  return '₱${amount.toStringAsFixed(amount == amount.roundToDouble() ? 0 : 2).replaceAllMapped(
    RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
    (m) => '${m[1]},',
  )}';
}
