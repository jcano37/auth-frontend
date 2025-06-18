import { useState, useCallback } from 'react';
import { MESSAGES } from '../constants';

/**
 * Hook personalizado para manejar llamadas a la API
 * Provides loading state, errors, and execution function
 * @returns {Object} Estado y funciones para manejar API calls
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Executes an API call with state management
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Configuration options
   * @param {Function} options.onSuccess - Callback executed on success
   * @param {Function} options.onError - Callback executed on error
   * @param {string} options.successMessage - Success message to display
   * @param {string} options.errorMessage - Custom error message
   * @param {boolean} options.showLoading - Whether to show loading state
   * @returns {Promise} Result of the API call
   */
  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      errorMessage,
      showLoading = true 
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (onSuccess) onSuccess(result);
      if (successMessage) {
        // A toast notification system could be integrated here
        console.log(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMsg = errorMessage || 
        err.response?.data?.detail || 
        err.message || 
        MESSAGES.ERROR.NETWORK;
      
      setError(errorMsg);
      
      if (onError) onError(err);
      
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /**
   * Clears the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

/**
 * Custom hook to handle API data lists
 * Proporciona funciones CRUD básicas para listas
 * @param {Array} initialData - Initial list data
 * @returns {Object} Estado y funciones para manejar listas
 */
export const useApiList = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches data from the API and updates the state
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Configuration options
   * @param {string} options.errorMessage - Custom error message
   * @param {Function} options.onSuccess - Callback executed on success
   * @returns {Promise} Data obtained from the API
   */
  const fetchData = useCallback(async (apiCall, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMsg = options.errorMessage || 
        err.response?.data?.detail || 
        MESSAGES.ERROR.FETCH;
      
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agrega un elemento a la lista
   * @param {Object} item - Elemento a agregar
   */
  const addItem = useCallback((item) => {
    setData(prev => [...prev, item]);
  }, []);

  /**
   * Actualiza un elemento en la lista por ID
   * @param {number|string} id - ID del elemento a actualizar
   * @param {Object} updatedItem - Datos actualizados del elemento
   */
  const updateItem = useCallback((id, updatedItem) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  }, []);

  /**
   * Removes an item from the list by ID
   * @param {number|string} id - ID del elemento a remover
   */
  const removeItem = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Clears the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Completely replaces the list data
   * @param {Array} newData - Nuevos datos para la lista
   */
  const replaceData = useCallback((newData) => {
    setData(newData);
  }, []);

  /**
   * Clears the data list
   */
  const clearData = useCallback(() => {
    setData([]);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    removeItem,
    clearError,
    setData: replaceData,
    clearData,
  };
}; 