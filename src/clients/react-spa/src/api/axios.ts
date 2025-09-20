import axios from 'axios';
import { store } from '../store/store'; // Import the Redux store

const api = axios.create({
  baseURL: 'http://localhost:5015/api',
});

// This interceptor runs before each request is sent
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // Get token from Redux state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;