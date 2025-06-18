/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';
import { STORAGE_KEYS, MESSAGES } from '../constants';

const AuthContext = createContext();

/**
 * Initial state of the authentication context
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
 * Reducer to manage authentication state
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
 * Authentication context provider
 * Manages the application's global authentication state
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationAttempted = useRef(false);
  const isInitializing = useRef(false);

  /**
   * Inicializa la autenticación verificando tokens existentes
   */
  useEffect(() => {
    // Prevent multiple initialization attempts
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

        // Validate token format before decoding
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            // Valid token, get user data
            try {
              const user = await authService.getCurrentUser();
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token, refreshToken },
              });
            } catch {
              // If user fetch fails, clear tokens
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            // Expired token, try to renew
            try {
              const newTokens = await authService.refreshToken(refreshToken);
              
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.access_token);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refresh_token);
              
              // Get user with the new token
              const user = await authService.getCurrentUser();
              
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user,
                  token: newTokens.access_token,
                  refreshToken: newTokens.refresh_token,
                },
              });
            } catch {
              // Renewal failed, clear tokens
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          }
        } catch {
          // Invalid token format, clear and logout
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Error during initialization
        console.error('Auth initialization error:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        dispatch({ type: 'LOGOUT' });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []); // Only run once

  /**
   * Función para iniciar sesión
   * @param {Object} credentials - User credentials
   */
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      
      // Save tokens to localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      
      // Get user data
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
   * Function to logout
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with local logout even if server fails
      console.warn('Server logout failed:', error);
    } finally {
      // Limpiar almacenamiento local y estado
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  /**
   * Function to register a new user (DEPRECATED - Registration now handled by admin)
   * @param {Object} userData - User data
   */
  // const register = useCallback(async (userData) => {
  //   dispatch({ type: 'LOGIN_START' });
  //   try {
  //     const response = await authService.register(userData);
  //     
  //     // If registration includes automatic login
  //     if (response.access_token) {
  //       localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
  //       localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
  //       
  //       const user = await authService.getCurrentUser();
  //       
  //       dispatch({
  //         type: 'LOGIN_SUCCESS',
  //         payload: {
  //           user,
  //           token: response.access_token,
  //           refreshToken: response.refresh_token,
  //         },
  //       });
  //     } else {
  //       dispatch({ type: 'SET_LOADING', payload: false });
  //     }
  //     
  //     return response;
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.detail || 
  //                         error.message || 
  //                         MESSAGES.ERROR.REGISTER;
  //     
  //     dispatch({
  //       type: 'LOGIN_FAILURE',
  //       payload: errorMessage,
  //     });
  //     throw error;
  //   }
  // }, []);

  /**
   * Function to update user data
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
    updateUser,
    clearError,
  }), [state, login, logout, updateUser, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} Authentication state and functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};