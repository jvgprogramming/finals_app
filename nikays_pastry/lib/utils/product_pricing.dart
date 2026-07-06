class SizeOption {
  final String label;
  final double multiplier;

  const SizeOption(this.label, this.multiplier);
}

const List<SizeOption> cakeSizeOptions = [
  SizeOption('6" Personal', 1.0),
  SizeOption('8" Celebration', 1.35),
  SizeOption('10" Grand', 1.75),
];

const List<SizeOption> pastrySizeOptions = [
  SizeOption('Solo Pack (6 pcs)', 1.0),
  SizeOption('A Dozen (12 pcs)', 1.9),
  SizeOption('Party Tray (24 pcs)', 3.6),
];

bool isPastryOrBreadCategory(String? categoryName) {
  final name = (categoryName ?? '').toLowerCase();
  return name.contains('pastries') || name.contains('pastry') ||
      name.contains('breads') || name.contains('bread');
}

List<SizeOption> getSizeOptionsForCategory(String? categoryName) {
  return isPastryOrBreadCategory(categoryName) ? pastrySizeOptions : cakeSizeOptions;
}

String getSizeOptionLabel(String? categoryName) {
  return isPastryOrBreadCategory(categoryName) ? 'Select Quantity' : 'Select Cake Size';
}

double getPriceForSize(double basePrice, String? size, String? categoryName) {
  final options = getSizeOptionsForCategory(categoryName);
  final option = options.where((s) => s.label == size).firstOrNull;
  final multiplier = option?.multiplier ?? 1.0;
  return (basePrice * multiplier * 100).roundToDouble() / 100;
}
