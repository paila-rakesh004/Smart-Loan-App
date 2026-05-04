import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:8000/api/'; 
const undef = "undefined";

const API = axios.create({
  baseURL: BASE_URL, 
  withCredentials: true, 
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error?.response?.status === 401 && originalRequest.url?.includes('login') && !originalRequest.url?.includes('refresh')) {
     throw error;
    }
    
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (globalThis.window == undef) throw new Error("Server-side execution, skipping refresh.");
        
        await axios.post(`${BASE_URL}users/refresh/`, {}, { withCredentials: true });
        
        return API(originalRequest);
      } catch (refreshError) {
        const message = refreshError?.response?.data?.error || "Session completely expired. Logging out.";
        toast.error(message);
        if (globalThis.window != undef) {
          await axios.post(`${BASE_URL}users/logout/`, {}, { withCredentials: true });
          globalThis.window.location.href = '/login'; 
        }
        throw refreshError;
      }
    }
    throw error;
  }
);
export default API;