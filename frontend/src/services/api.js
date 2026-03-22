import axios from "axios";

const normalizeApiBaseURL = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "/api";
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  if (/^https?:\/\//i.test(raw)) {
    const withoutTrailingSlash = raw.replace(/\/+$/, "");
    return withoutTrailingSlash.endsWith("/api")
      ? withoutTrailingSlash
      : `${withoutTrailingSlash}/api`;
  }

  return raw;
};

const baseURL = normalizeApiBaseURL(import.meta.env.VITE_API_URL || "/api");

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
