import axios from "axios";

// In local dev, "/api" is proxied to localhost:5000 by Vite (see vite.config.js).
// In production (Vercel), there's no proxy — VITE_API_URL must point directly
// at your deployed Render backend, e.g. https://chatsphere-api.onrender.com
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token as a fallback (in case cookies are blocked, e.g. some
// mobile webviews) — token is also stored in localStorage on login/register.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("chatsphere_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
