import axios from "axios";
import { getToken } from "./auth";

const raw = import.meta.env.VITE_API_URL;
const baseURL =
  typeof raw === "string" && raw.trim() ? raw.trim().replace(/\/+$/, "") : "";

if (!baseURL) {
  console.error("VITE_API_URL is empty. Fix .env(.local) and restart dev server.");
}

const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
