import { API_BASE_URL } from '../api/client';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${API_BASE_URL}/${clean}`;
}
