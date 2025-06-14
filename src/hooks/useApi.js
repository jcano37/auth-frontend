import { useState, useCallback } from 'react';
import { MESSAGES } from '../constants';

/**
 * Hook personalizado para manejar llamadas a la API
 * Proporciona estado de carga, errores y función de ejecución
 * @returns {Object} Estado y funciones para manejar API calls
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta una llamada a la API con manejo de estado
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Opciones de configuración
   * @param {Function} options.onSuccess - Callback ejecutado en caso de éxito
   * @param {Function} options.onError - Callback ejecutado en caso de error
   * @param {string} options.successMessage - Mensaje de éxito a mostrar
   * @param {string} options.errorMessage - Mensaje de error personalizado
   * @param {boolean} options.showLoading - Si mostrar estado de carga
   * @returns {Promise} Resultado de la llamada a la API
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
        // Aquí se podría integrar con un sistema de notificaciones toast
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
   * Limpia el estado de error
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
 * Hook personalizado para manejar listas de datos de la API
 * Proporciona funciones CRUD básicas para listas
 * @param {Array} initialData - Datos iniciales de la lista
 * @returns {Object} Estado y funciones para manejar listas
 */
export const useApiList = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtiene datos de la API y actualiza el estado
   * @param {Function} apiCall - Función que realiza la llamada a la API
   * @param {Object} options - Opciones de configuración
   * @param {string} options.errorMessage - Mensaje de error personalizado
   * @returns {Promise} Datos obtenidos de la API
   */
  const fetchData = useCallback(async (apiCall, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
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
   * Remueve un elemento de la lista por ID
   * @param {number|string} id - ID del elemento a remover
   */
  const removeItem = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reemplaza completamente los datos de la lista
   * @param {Array} newData - Nuevos datos para la lista
   */
  const replaceData = useCallback((newData) => {
    setData(newData);
  }, []);

  /**
   * Limpia la lista de datos
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