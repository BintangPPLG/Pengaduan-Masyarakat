import client from './client';

export async function loginRequest(email, password) {
  const { data } = await client.post('/login', { email, password });
  return data;
}

export async function registerRequest(username, email, password) {
  const { data } = await client.post('/register', {
    username,
    email,
    password,
  });
  return data;
}
