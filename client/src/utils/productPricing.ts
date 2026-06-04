/** Cake size options; base product.price is the 6" Personal price. */
export const CAKE_SIZE_OPTIONS = [
  { label: '6" Personal', multiplier: 1 },
  { label: '8" Celebration', multiplier: 1.35 },
  { label: '10" Grand', multiplier: 1.75 },
] as const;

/** Pastry / bread quantity tiers; base price is for 6 pcs. */
export const PASTRY_SIZE_OPTIONS = [
  { label: 'Solo Pack (6 pcs)', multiplier: 1 },
  { label: 'A Dozen (12 pcs)', multiplier: 1.9 },
  { label: 'Party Tray (24 pcs)', multiplier: 3.6 },
] as const;

export type CakeSizeLabel = (typeof CAKE_SIZE_OPTIONS)[number]['label'];
export type PastrySizeLabel = (typeof PASTRY_SIZE_OPTIONS)[number]['label'];
export type SizeOption = (typeof CAKE_SIZE_OPTIONS)[number] | (typeof PASTRY_SIZE_OPTIONS)[number];

export function isPastryOrBreadCategory(categoryName: string | null | undefined): boolean {
  const name = (categoryName ?? '').toLowerCase();
  return name.includes('pastries') || name.includes('pastry') || name.includes('breads') || name.includes('bread');
}

export function getSizeOptionsForCategory(
  categoryName: string | null | undefined,
): readonly SizeOption[] {
  return isPastryOrBreadCategory(categoryName) ? PASTRY_SIZE_OPTIONS : CAKE_SIZE_OPTIONS;
}

export function getSizeOptionLabel(categoryName: string | null | undefined): string {
  return isPastryOrBreadCategory(categoryName) ? 'Select Quantity' : 'Select Cake Size';
}

export function getPriceForSize(
  basePrice: number,
  size: string | null | undefined,
  categoryName?: string | null,
): number {
  const options = getSizeOptionsForCategory(categoryName);
  const option = options.find((s) => s.label === size);
  const multiplier = option?.multiplier ?? 1;
  return Math.round(basePrice * multiplier * 100) / 100;
}

export function getCakeSizeLabels(): string[] {
  return CAKE_SIZE_OPTIONS.map((s) => s.label);
}
