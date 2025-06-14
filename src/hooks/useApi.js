import { useState, useCallback } from 'react';
import { MESSAGES } from '../constants';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        // Here you could integrate with a toast notification system
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

export const useApiList = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const addItem = useCallback((item) => {
    setData(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id, updatedItem) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
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
    setData,
  };
}; 