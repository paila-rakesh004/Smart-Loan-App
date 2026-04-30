import axios from 'axios';
const BASE_URL = 'http://127.0.0.1:8000/api/';
const undef = "undefined"
const API = axios.create({
  baseURL: BASE_URL, 
});
API.interceptors.request.use(
  (config) => {
    if (globalThis.window != undef) {
      const token = globalThis.window.localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    throw error;
  }
);
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && originalRequest.url?.includes('token/') && !originalRequest.url?.includes('refresh')) {
     throw error;
    }
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (globalThis.window == undef) throw new Error("Server-side execution, skipping refresh.");
        const refreshToken = globalThis.window.localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }
        const res = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        globalThis.window.localStorage.setItem('access_token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return API(originalRequest);
      } catch (refreshError) {
        const message = refreshError?.response?.data?.error || "Session completely expired. Logging out."
        toast.error(message);
        if (globalThis.window != undef) {
          globalThis.window.localStorage.removeItem('access_token');
          globalThis.window.localStorage.removeItem('refresh_token');
          globalThis.window.localStorage.removeItem('username');
          globalThis.window.location.href = '/login'; 
        }
        throw refreshError;
      }
    }
    throw error;
  }
);
export default API;