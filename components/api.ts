import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "https://hive-backend-5y59.onrender.com/api";

// Store token in module scope — persists across navigation
let userToken: string | null = null;

export const setToken = (token: string) => {
  userToken = token;
  if (token) {
    void AsyncStorage.setItem("auth_token", token);
  }
  console.log("Token set:", token ? "YES" : "NO (received: " + typeof token + ")");
};

export const clearToken = () => {
  userToken = null;
  void AsyncStorage.removeItem("auth_token");
};

export const getToken = () => userToken;

export const loadToken = async () => {
  try {
    userToken = await AsyncStorage.getItem("auth_token");
  } catch {
    userToken = null;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  } else {
    console.log("WARNING: No token set for request to", config.url);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 on:", error.config?.url);
    }
    return Promise.reject(error);
  },
);

export default api;
