import axios from 'axios';

const api = axios.create({
  baseURL: 'hhttps://grh-datalinks-api-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const isLoginRequest = error.config?.url?.includes('/login');

    // Ne déconnecte / ne redirige que si le 401 vient d'une route protégée,
    // jamais sur une tentative de connexion elle-même (sinon Login.jsx
    // ne peut jamais afficher son message d'erreur "identifiants incorrects")
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;