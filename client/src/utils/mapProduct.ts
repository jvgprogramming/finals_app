import type { Product } from '../services/ProductService';
import { resolveProductImageUrl } from './imageUrl';

/** UI-friendly product shape used across customer and admin views */
export type UiProduct = Product & {
  image: string | null;
  categoryLabel: string;
  available: boolean;
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop';

export function mapProductFromApi(product: Product): UiProduct {
  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name ?? 'Uncategorized';

  return {
    ...product,
    image: resolveProductImageUrl(product.image_url) || PLACEHOLDER_IMAGE,
    image_url: resolveProductImageUrl(product.image_url),
    categoryLabel: categoryName,
    category: product.category,
    available: product.is_available ?? true,
  };
}

export function mapProductsFromApi(products: Product[]): UiProduct[] {
  return products.map(mapProductFromApi);
}
