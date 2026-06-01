const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

/** Turn Laravel `/storage/...` paths into absolute URLs the Vite app can load. */
export function resolveProductImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }
  return `${API_ORIGIN}/storage/products/${url}`;
}
