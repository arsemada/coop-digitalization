import api from '../api/client';

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeAuth = (loginResponse) => {
  if (loginResponse?.token) localStorage.setItem('token', loginResponse.token);
  if (loginResponse) {
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: loginResponse.username,
        role: loginResponse.role,
        institutionId: loginResponse.institutionId,
        institutionName: loginResponse.institutionName,
      })
    );
  }
};
