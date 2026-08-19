import axios from 'axios';

// Live backend URL — works for both web and mobile
const API_URL = 'https://hive-backend-5y59.onrender.com/api';

let userToken: string | null = null;

export const setToken = (token: string) => { userToken = token; };
export const clearToken = () => { userToken = null; };

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

export default api;