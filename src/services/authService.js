import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Instancia de Axios configurada para la API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request para agregar token de autenticación
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

/**
 * Interceptor de response para manejar renovación de tokens
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
        // Limpiar tokens si la renovación falla
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        // Solo redirigir si no estamos en páginas públicas o requests específicos
        const isPublicPage = ['/login', '/register', '/forgot-password'].some(path => 
          window.location.pathname.includes(path)
        );
        const isAuthContextRequest = originalRequest.url.includes('/users/me');
        const isRefreshRequest = originalRequest.url.includes('/auth/refresh');
        
        if (!isPublicPage && !isAuthContextRequest && !isRefreshRequest) {
          // Pequeño delay para prevenir condiciones de carrera
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ==================== ENDPOINTS DE AUTENTICACIÓN ====================

/**
 * Iniciar sesión con credenciales de usuario
 * @param {Object} credentials - Credenciales de login
 * @param {string} credentials.username - Nombre de usuario o email
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<Object>} Respuesta con tokens de acceso
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
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Respuesta del registro
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Cerrar sesión del usuario actual
 * @returns {Promise<Object>} Respuesta del logout
 */
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

/**
 * Renovar token de acceso usando refresh token
 * @param {string} refreshToken - Token de renovación
 * @returns {Promise<Object>} Nuevos tokens
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Solicitar restablecimiento de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Respuesta de la solicitud
 */
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/password-reset-request', { email });
  return response.data;
};

/**
 * Restablecer contraseña con token
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Respuesta del restablecimiento
 */
export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/password-reset', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// ==================== ENDPOINTS DE USUARIOS ====================

/**
 * Obtener datos del usuario actual
 * @returns {Promise<Object>} Datos del usuario
 */
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

/**
 * Actualizar datos del usuario actual
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

/**
 * Obtener lista de usuarios (admin)
 * @param {number} skip - Número de registros a omitir
 * @param {number} limit - Límite de registros
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsers = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Obtener usuario por ID (admin)
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Crear nuevo usuario (admin)
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

/**
 * Actualizar usuario por ID (admin)
 * @param {number} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Eliminar usuario por ID (admin)
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// ==================== ENDPOINTS DE ROLES ====================

/**
 * Obtener lista de roles
 * @param {number} skip - Número de registros a omitir
 * @param {number} limit - Límite de registros
 * @returns {Promise<Array>} Lista de roles
 */
export const getRoles = async (skip = 0, limit = 100) => {
  const response = await api.get(`/roles/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Obtener rol por ID
 * @param {number} roleId - ID del rol
 * @returns {Promise<Object>} Datos del rol
 */
export const getRoleById = async (roleId) => {
  const response = await api.get(`/roles/${roleId}`);
  return response.data;
};

/**
 * Crear nuevo rol
 * @param {Object} roleData - Datos del rol
 * @returns {Promise<Object>} Rol creado
 */
export const createRole = async (roleData) => {
  const response = await api.post('/roles/', roleData);
  return response.data;
};

/**
 * Actualizar rol por ID
 * @param {number} roleId - ID del rol
 * @param {Object} roleData - Datos a actualizar
 * @returns {Promise<Object>} Rol actualizado
 */
export const updateRole = async (roleId, roleData) => {
  const response = await api.put(`/roles/${roleId}`, roleData);
  return response.data;
};

/**
 * Eliminar rol por ID
 * @param {number} roleId - ID del rol
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteRole = async (roleId) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
};

/**
 * Asignar permiso a rol
 * @param {number} roleId - ID del rol
 * @param {number} permissionId - ID del permiso
 * @returns {Promise<Object>} Respuesta de asignación
 */
export const assignPermissionToRole = async (roleId, permissionId) => {
  const response = await api.post(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

/**
 * Remover permiso de rol
 * @param {number} roleId - ID del rol
 * @param {number} permissionId - ID del permiso
 * @returns {Promise<Object>} Respuesta de remoción
 */
export const removePermissionFromRole = async (roleId, permissionId) => {
  const response = await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
  return response.data;
};

// ==================== ENDPOINTS DE PERMISOS ====================

/**
 * Obtener lista de permisos
 * @param {number} skip - Número de registros a omitir
 * @param {number} limit - Límite de registros
 * @returns {Promise<Array>} Lista de permisos
 */
export const getPermissions = async (skip = 0, limit = 100) => {
  const response = await api.get(`/permissions/?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Obtener permiso por ID
 * @param {number} permissionId - ID del permiso
 * @returns {Promise<Object>} Datos del permiso
 */
export const getPermissionById = async (permissionId) => {
  const response = await api.get(`/permissions/${permissionId}`);
  return response.data;
};

/**
 * Crear nuevo permiso
 * @param {Object} permissionData - Datos del permiso
 * @returns {Promise<Object>} Permiso creado
 */
export const createPermission = async (permissionData) => {
  const response = await api.post('/permissions/', permissionData);
  return response.data;
};

/**
 * Actualizar permiso por ID
 * @param {number} permissionId - ID del permiso
 * @param {Object} permissionData - Datos a actualizar
 * @returns {Promise<Object>} Permiso actualizado
 */
export const updatePermission = async (permissionId, permissionData) => {
  const response = await api.put(`/permissions/${permissionId}`, permissionData);
  return response.data;
};

/**
 * Eliminar permiso por ID
 * @param {number} permissionId - ID del permiso
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deletePermission = async (permissionId) => {
  const response = await api.delete(`/permissions/${permissionId}`);
  return response.data;
};

// ==================== ENDPOINTS DE SESIONES ====================

/**
 * Obtener sesiones activas del usuario actual
 * @returns {Promise<Array>} Lista de sesiones activas
 */
export const getCurrentUserSessions = async () => {
  const response = await api.get('/users/me/sessions');
  return response.data;
};

/**
 * Revocar una sesión específica del usuario actual
 * @param {number} sessionId - ID de la sesión
 * @returns {Promise<Object>} Respuesta de revocación
 */
export const revokeSession = async (sessionId) => {
  const response = await api.delete(`/users/me/sessions/${sessionId}`);
  return response.data;
};

/**
 * Revocar todas las sesiones del usuario actual excepto la actual
 * @returns {Promise<Object>} Respuesta de revocación
 */
export const revokeAllSessions = async () => {
  const response = await api.delete('/users/me/sessions');
  return response.data;
};

/**
 * Obtener estadísticas de usuarios activos (admin)
 * @returns {Promise<Object>} Estadísticas de usuarios activos
 */
export const getActiveUsersStats = async () => {
  const response = await api.get('/users/active-stats');
  return response.data;
};

/**
 * Obtener todas las sesiones activas (admin)
 * @param {number} skip - Número de registros a omitir
 * @param {number} limit - Límite de registros
 * @returns {Promise<Array>} Lista de sesiones activas
 */
export const getActiveSessions = async (skip = 0, limit = 100) => {
  const response = await api.get(`/users/active-sessions?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * Revocar cualquier sesión (admin)
 * @param {number} sessionId - ID de la sesión
 * @returns {Promise<Object>} Respuesta de revocación
 */
export const adminRevokeSession = async (sessionId) => {
  const response = await api.delete(`/users/sessions/${sessionId}`);
  return response.data;
};

export default api; 