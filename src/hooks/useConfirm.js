import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to handle confirmation dialogs
 * Provides a clean interface for showing confirmations
 * @returns {Object} State and functions to handle confirmations
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    icon: null,
  });

  // Use useRef to maintain a stable reference to the confirmation function
  const onConfirmRef = useRef(null);

  /**
   * Displays a confirmation dialog
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Confirmation message
   * @param {string} options.confirmText - Confirmation button text
   * @param {string} options.cancelText - Cancel button text
   * @param {string} options.type - Confirmation type ('danger', 'warning', 'info')
   * @param {React.ReactNode} options.icon - Custom icon
   * @returns {Promise<boolean>} Promise that resolves true if confirmed, false if cancelled
   */
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      onConfirmRef.current = () => resolve(true);
      
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        icon: options.icon || null,
      });
    });
  }, []);

  /**
   * Closes the confirmation dialog
   */
  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false,
    }));
    // Clear the reference
    onConfirmRef.current = null;
  }, []);

  /**
   * Handles confirmation
   */
  const handleConfirm = useCallback(() => {
    if (onConfirmRef.current) {
      onConfirmRef.current();
    }
    closeConfirm();
  }, [closeConfirm]);

  return {
    confirmState,
    confirm,
    closeConfirm,
    handleConfirm,
  };
}; 