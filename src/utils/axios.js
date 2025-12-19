import axios from "axios";
import { getToken } from "./auth";

const rawBaseURL = import.meta.env.VITE_API_URL;

// убираем хвостовой слэш, чтобы не получать //posts
const baseURL =
  typeof rawBaseURL === "string" && rawBaseURL.trim()
    ? rawBaseURL.trim().replace(/\/+$/, "")
    : null;

if (!baseURL) {
  // Жёстко валим запрос, чтобы ты сразу увидел причину, а не ловил 404 на Vite
  console.error(
    "VITE_API_URL is not set. Add it to .env / .env.local, e.g. VITE_API_URL=http://localhost:3000"
  );
}

const instance = axios.create({
  baseURL: baseURL || "http://localhost:3000", // временный fallback, поменяй порт под свой backend
});

// ---- Добавляем токен в каждый запрос ----
instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
