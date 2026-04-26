import axios from 'axios';

// Debe coincidir con app.include_router(..., prefix=API_PREFIX) + /v1 (p. ej. /api/v1)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle generic global errors here
    return Promise.reject(error);
  }
);
