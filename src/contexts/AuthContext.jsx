import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';
import { STORAGE_KEYS, MESSAGES } from '../constants';

const AuthContext = createContext();

/**
 * Estado inicial del contexto de autenticación
 */
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Reducer para manejar el estado de autenticación
 * @param {Object} state - Estado actual
 * @param {Object} action - Acción a ejecutar
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationAttempted = useRef(false);
  const isInitializing = useRef(false);

  /**
   * Inicializa la autenticación verificando tokens existentes
   */
  useEffect(() => {
    // Prevenir múltiples intentos de inicialización
    if (initializationAttempted.current || isInitializing.current) {
      return;
    }
    
    initializationAttempted.current = true;
    isInitializing.current = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!token || !refreshToken) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Validar formato del token antes de decodificar
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            // Token válido, obtener datos del usuario
            try {
              const user = await authService.getCurrentUser();
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token, refreshToken },
              });
            } catch (userError) {
              // Si falla obtener usuario, limpiar tokens
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            // Token expirado, intentar renovar
            try {
              const newTokens = await authService.refreshToken(refreshToken);
              
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.access_token);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refresh_token);
              
              // Obtener usuario con el nuevo token
              const user = await authService.getCurrentUser();
              
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user,
                  token: newTokens.access_token,
                  refreshToken: newTokens.refresh_token,
                },
              });
            } catch (refreshError) {
              // Fallo en renovación, limpiar tokens
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          }
        } catch (tokenError) {
          // Token con formato inválido, limpiar y cerrar sesión
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Error durante la inicialización
        console.error('Auth initialization error:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        dispatch({ type: 'LOGOUT' });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []); // Solo ejecutar una vez

  /**
   * Función para iniciar sesión
   * @param {Object} credentials - Credenciales de usuario
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      
      // Guardar tokens en localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      
      // Obtener datos del usuario
      const user = await authService.getCurrentUser();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.access_token,
          refreshToken: response.refresh_token,
        },
      });

      return { user, token: response.access_token };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          MESSAGES.ERROR.LOGIN;
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continuar con el logout local aunque falle el servidor
      console.warn('Server logout failed:', error);
    } finally {
      // Limpiar almacenamiento local y estado
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * Función para registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      
      // Si el registro incluye login automático
      if (response.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        
        const user = await authService.getCurrentUser();
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token: response.access_token,
            refreshToken: response.refresh_token,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          MESSAGES.ERROR.REGISTER;
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  /**
   * Función para actualizar datos del usuario
   * @param {Object} userData - Datos actualizados
   */
  const updateUser = useCallback(async (userData) => {
    try {
      const updatedUser = await authService.updateCurrentUser(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          MESSAGES.ERROR.UPDATE;
      
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  /**
   * Función para limpiar errores
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Memoizar el valor del contexto para optimizar renders
  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    register,
    updateUser,
    clearError,
  }), [state, login, logout, register, updateUser, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} Estado y funciones de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 