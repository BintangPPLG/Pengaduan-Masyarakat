import type { Category } from './types';
import { apiGet } from './client';

export function fetchCategories() {
  return apiGet<Category[]>('/categories');
}
