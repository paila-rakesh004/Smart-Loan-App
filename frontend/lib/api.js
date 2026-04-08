import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';

const API = axios.create({
  baseURL: BASE_URL, 
});

API.interceptors.request.use(
  (config) => {
    
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && originalRequest.url?.includes('token/') && !originalRequest.url?.includes('refresh')) {
        return Promise.reject(error); 
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        
        if (typeof window === "undefined") throw new Error("Server-side execution, skipping refresh.");

        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error("No refresh token found");
        }
        
       
        const res = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return API(originalRequest);
        
      } catch (refreshError) {
        console.error("Session completely expired. Logging out.");
        
        if (typeof window !== "undefined") {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('username');
          window.location.href = '/login'; 
        }
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;