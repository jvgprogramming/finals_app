const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

/** Turn Laravel `/storage/...` paths into absolute URLs the Vite app can load. */
export function resolveProductImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const normalized = url.replace(/\\/g, '/');

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${API_ORIGIN}${normalized}`;
  }

  if (normalized.startsWith('products/')) {
    return `${API_ORIGIN}/storage/${normalized}`;
  }

  if (normalized.startsWith('storage/')) {
    return `${API_ORIGIN}/${normalized}`;
  }

  if (normalized.startsWith('public/')) {
    return `${API_ORIGIN}/${normalized.replace(/^public\//, 'storage/')}`;
  }

  return `${API_ORIGIN}/storage/products/${normalized}`;
}
