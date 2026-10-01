import { API_BASE_URL } from '@/constants/api';

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${clean}`;
}

/**
 * Parse the `images` field from the backend (may be a JSON string or already an array)
 * and return an array of full image URLs.
 */
export function getImageUrls(images: string | string[] | null | undefined): string[] {
  if (!images) return [];
  let paths: string[] = [];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      paths = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      paths = [images];
    }
  } else if (Array.isArray(images)) {
    paths = images;
  }
  return paths.map((p) => getImageUrl(p)).filter(Boolean) as string[];
}
