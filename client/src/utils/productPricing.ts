/** Cake size options; base product.price is the 6" Personal price. */
export const CAKE_SIZE_OPTIONS = [
  { label: '6" Personal', multiplier: 1 },
  { label: '8" Celebration', multiplier: 1.35 },
  { label: '10" Grand', multiplier: 1.75 },
] as const;

export type CakeSizeLabel = (typeof CAKE_SIZE_OPTIONS)[number]['label'];

export function getPriceForSize(basePrice: number, size: string | null | undefined): number {
  const option = CAKE_SIZE_OPTIONS.find((s) => s.label === size);
  const multiplier = option?.multiplier ?? 1;
  return Math.round(basePrice * multiplier * 100) / 100;
}

export function getCakeSizeLabels(): string[] {
  return CAKE_SIZE_OPTIONS.map((s) => s.label);
}
