import client from './client';

export async function fetchUsers() {
  const { data } = await client.get('/users');
  return data;
}

export async function createUser(payload) {
  const { data } = await client.post('/users', payload);
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await client.patch(`/users/${id}/role`, { role });
  return data;
}

export async function deleteUser(id) {
  const { data } = await client.delete(`/users/${id}`);
  return data;
}
