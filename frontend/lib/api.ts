import axios, { AxiosError } from "axios";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/store/auth";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const isAuthEndpoint = (url?: string) => !!url && url.startsWith("/auth/");

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hadSession = !!useAuth.getState().token;
    if (error.response?.status === 401 && hadSession && !isAuthEndpoint(error.config?.url)) {
      // Token kedaluwarsa atau tidak valid: bersihkan sesi dan arahkan ke login.
      useAuth.getState().logout();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(err: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!err.response) return "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.";
  }
  return fallback;
}

export function getStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}
