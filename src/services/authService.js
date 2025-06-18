import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Axios instance configured for the API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define the token expiration time in milliseconds (1 hour)
const TOKEN_EXPIRATION_TIME = 3600000;

/**
 * Response interceptor to handle token renewal
 */
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
      } catch {
        // Clear tokens if renewal fails
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        // Only redirect if we're not on public pages or specific requests
        const isPublicPage = ['/login', '/register', '/forgot-password'].some(path => 
          window.location.pathname.includes(path)
        );
        const isAuthContextRequest = originalRequest.url.includes('/users/me');
        const isRefreshRequest = originalRequest.url.includes('/auth/refresh');
        
        if (!isPublicPage && !isAuthContextRequest && !isRefreshRequest) {
          // Small delay to prevent race conditions
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * Log in with user credentials
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username or email
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with access tokens
 */
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

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Log out current user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Renew access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<Object>} Request response
 */
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/password-reset-request', { email });
  return response.data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset response
 */
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/password-reset', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// ==================== USER ENDPOINTS ====================

/**
 * Get current user data
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

/**
 * Update current user data
 * @param {Object} userData - Data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

/**
 * Get list of users (admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Record limit
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Get user by ID (admin)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Create new user (admin)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

/**
 * Update user by ID (admin)
 * @param {number} userId - User ID
 * @param {Object} userData - Data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user by ID (admin)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// ==================== ROLE ENDPOINTS ====================

/**
 * Get list of roles
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Record limit
 * @returns {Promise<Array>} List of roles
 */
export const getRoles = async (skip = 0, limit = 100) => {
  const response = await api.get(`/roles/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Get role by ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Role data
 */
export const getRoleById = async (roleId) => {
  const response = await api.get(`/roles/${roleId}`);
  return response.data;
};

/**
 * Create new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role
 */
export const createRole = async (roleData) => {
  const response = await api.post('/roles/', roleData);
  return response.data;
};

/**
 * Update role by ID
 * @param {number} roleId - Role ID
 * @param {Object} roleData - Data to update
 * @returns {Promise<Object>} Updated role
 */
export const updateRole = async (roleId, roleData) => {
  const response = await api.put(`/roles/${roleId}`, roleData);
  return response.data;
};

/**
 * Delete role by ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteRole = async (roleId) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
};

/**
 * Assign permission to role
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise<Object>} Assignment response
 */
export const assignPermissionToRole = async (roleId, permissionId) => {
  const response = await api.post(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

/**
 * Remove permission from role
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise<Object>} Removal response
 */
export const removePermissionFromRole = async (roleId, permissionId) => {
  const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

// ==================== PERMISSION ENDPOINTS ====================

/**
 * Get list of permissions
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Record limit
 * @returns {Promise<Array>} List of permissions
 */
export const getPermissions = async (skip = 0, limit = 100) => {
  const response = await api.get(`/permissions/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Get permission by ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise<Object>} Permission data
 */
export const getPermissionById = async (permissionId) => {
  const response = await api.get(`/permissions/${permissionId}`);
  return response.data;
};

/**
 * Create new permission
 * @param {Object} permissionData - Permission data
 * @returns {Promise<Object>} Created permission
 */
export const createPermission = async (permissionData) => {
  const response = await api.post('/permissions/', permissionData);
  return response.data;
};

/**
 * Update permission by ID
 * @param {number} permissionId - Permission ID
 * @param {Object} permissionData - Data to update
 * @returns {Promise<Object>} Updated permission
 */
export const updatePermission = async (permissionId, permissionData) => {
  const response = await api.put(`/permissions/${permissionId}`, permissionData);
  return response.data;
};

/**
 * Delete permission by ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise<Object>} Deletion response
 */
export const deletePermission = async (permissionId) => {
  const response = await api.delete(`/permissions/${permissionId}`);
  return response.data;
};

// ==================== RESOURCE TYPE ENDPOINTS ====================

/**
 * Get all resource types
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Record limit
 * @returns {Promise<Array>} List of resource types
 */
export const getResourceTypes = async (skip = 0, limit = 100) => {
  const response = await api.get(`/resources/?skip=${skip}&limit=${limit}`);
  return response.data;
};

// ==================== SESSION ENDPOINTS ====================

/**
 * Get all sessions for the current user
 * @returns {Promise<Array>} List of active sessions
 */
export const getCurrentUserSessions = async () => {
  const response = await api.get('/users/me/sessions');
  return response.data;
};

/**
 * Revoke a specific session
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Revocation response
 */
export const revokeSession = async (sessionId) => {
  const response = await api.delete(`/users/me/sessions/${sessionId}`);
  return response.data;
};

/**
 * Revoke all sessions except the current one
 * @returns {Promise<Object>} Revocation response
 */
export const revokeAllSessions = async () => {
  const response = await api.delete('/users/me/sessions');
  return response.data;
};

/**
 * Get active users statistics (admin)
 * @returns {Promise<Object>} Active users statistics
 */
export const getActiveUsersStats = async () => {
  const response = await api.get('/users/active-stats');
  return response.data;
};

/**
 * Get all active sessions (admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Record limit
 * @returns {Promise<Array>} List of active sessions
 */
export const getActiveSessions = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/active-sessions?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Revoke any session (admin)
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Revocation response
 */
export const adminRevokeSession = async (sessionId) => {
  const response = await api.delete(`/users/sessions/${sessionId}`);
  return response.data;
};

export default api; 