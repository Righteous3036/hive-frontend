import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // On mobile devices running Expo, hostUri points to your computer's IP
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:5000/api`;
    }
  }

  return "http://192.168.100.180:5000/api";
};

const API_URL = getApiBaseUrl();
console.log("[Hive API] Connected to:", API_URL);

// Store token in module scope ? persists across navigation
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
    console.log("[Hive API] Token loaded:", userToken ? "YES" : "NO");
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
