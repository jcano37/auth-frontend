import React, { createContext, useContext, useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const initializationAttempted = useRef(false);
  const isInitializing = useRef(false);

  // Check for existing token on app load
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
            // Token is still valid, try to get user
            try {
              const user = await authService.getCurrentUser();
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token, refreshToken },
              });
            } catch (userError) {
              console.warn('AuthContext: Failed to get current user:', userError);
              // If getCurrentUser fails, clear tokens and set as unauthenticated
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            // Token is expired, try to refresh
            try {
              const newTokens = await authService.refreshToken(refreshToken);
              
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.access_token);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refresh_token);
              
              // Try to get user with new token
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
              console.warn('AuthContext: Token refresh failed:', refreshError);
              // Refresh failed, clear tokens and set as unauthenticated
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              dispatch({ type: 'LOGOUT' });
            }
          }
        } catch (tokenError) {
          console.warn('AuthContext: Invalid token format:', tokenError);
          // Invalid token format, clear and logout
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // Any other error during initialization
        console.error('AuthContext: Auth initialization error:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        dispatch({ type: 'LOGOUT' });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // Save tokens to localStorage FIRST
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      
      // Verify tokens were saved
      const savedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      console.log('Token saved to localStorage:', savedToken ? 'Yes' : 'No');
      console.log('Storage key used:', STORAGE_KEYS.ACCESS_TOKEN);
      
      // Now get user data with the saved token
      const user = await authService.getCurrentUser();
      console.log('User data retrieved:', user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.access_token,
          refreshToken: response.refresh_token,
        },
      });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Clear tokens if login fails
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.detail || 'Login failed',
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.detail || 'Registration failed',
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback(async (userData) => {
    try {
      const updatedUser = await authService.updateCurrentUser(userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.detail || 'Update failed',
      });
      throw error;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.detail || 'Password reset request failed',
      });
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.detail || 'Password reset failed',
      });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    updateUser,
    requestPasswordReset,
    resetPassword,
    clearError,
  }), [
    state,
    login,
    register,
    logout,
    updateUser,
    requestPasswordReset,
    resetPassword,
    clearError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 