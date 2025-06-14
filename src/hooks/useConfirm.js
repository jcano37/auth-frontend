import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar diálogos de confirmación
 * Proporciona una interfaz limpia para mostrar confirmaciones
 * @returns {Object} Estado y funciones para manejar confirmaciones
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

  // Usar useRef para mantener una referencia estable a la función de confirmación
  const onConfirmRef = useRef(null);

  /**
   * Muestra un diálogo de confirmación
   * @param {Object} options - Opciones del diálogo
   * @param {string} options.title - Título del diálogo
   * @param {string} options.message - Mensaje de confirmación
   * @param {string} options.confirmText - Texto del botón de confirmación
   * @param {string} options.cancelText - Texto del botón de cancelar
   * @param {string} options.type - Tipo de confirmación ('danger', 'warning', 'info')
   * @param {React.ReactNode} options.icon - Icono personalizado
   * @returns {Promise<boolean>} Promise que resuelve true si se confirma, false si se cancela
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
   * Cierra el diálogo de confirmación
   */
  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false,
    }));
    // Limpiar la referencia
    onConfirmRef.current = null;
  }, []);

  /**
   * Maneja la confirmación
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