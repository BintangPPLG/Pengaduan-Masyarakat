import client from './client';

export async function fetchCategories() {
  const { data } = await client.get('/categories');
  return data;
}

export async function createCategory(category_name) {
  const { data } = await client.post('/categories', { category_name });
  return data;
}

export async function updateCategory(id, category_name) {
  const { data } = await client.put(`/categories/${id}`, { category_name });
  return data;
}

export async function deleteCategory(id) {
  const { data } = await client.delete(`/categories/${id}`);
  return data;
}
