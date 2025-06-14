import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('Request interceptor - Token found:', token ? 'Yes' : 'No');
    console.log('Request interceptor - URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Authorization header set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Token refresh failed in interceptor:', refreshError);
        
        // Clear tokens but don't redirect automatically
        // Let the AuthContext handle the authentication state
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        // Only redirect if:
        // 1. We're not already on a public page (login, register, forgot-password)
        // 2. This isn't a request from the AuthContext initialization (/users/me)
        // 3. This isn't a refresh token request
        const isPublicPage = ['/login', '/register', '/forgot-password'].some(path => 
          window.location.pathname.includes(path)
        );
        const isAuthContextRequest = originalRequest.url.includes('/users/me');
        const isRefreshRequest = originalRequest.url.includes('/auth/refresh');
        
        if (!isPublicPage && !isAuthContextRequest && !isRefreshRequest) {
          // Add a small delay to prevent race conditions
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (credentials) => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/password-reset-request', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/password-reset', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// User endpoints
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateCurrentUser = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

export const getUsers = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Role endpoints
export const getRoles = async (skip = 0, limit = 100) => {
  const response = await api.get(`/roles/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getRoleById = async (roleId) => {
  const response = await api.get(`/roles/${roleId}`);
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post('/roles/', roleData);
  return response.data;
};

export const updateRole = async (roleId, roleData) => {
  const response = await api.put(`/roles/${roleId}`, roleData);
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
};

export const assignPermissionToRole = async (roleId, permissionId) => {
  const response = await api.post(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

export const removePermissionFromRole = async (roleId, permissionId) => {
  const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

// Permission endpoints
export const getPermissions = async (skip = 0, limit = 100) => {
  const response = await api.get(`/permissions/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getPermissionById = async (permissionId) => {
  const response = await api.get(`/permissions/${permissionId}`);
  return response.data;
};

export const createPermission = async (permissionData) => {
  const response = await api.post('/permissions/', permissionData);
  return response.data;
};

export const updatePermission = async (permissionId, permissionData) => {
  const response = await api.put(`/permissions/${permissionId}`, permissionData);
  return response.data;
};

export const deletePermission = async (permissionId) => {
  const response = await api.delete(`/permissions/${permissionId}`);
  return response.data;
};

export default api; 