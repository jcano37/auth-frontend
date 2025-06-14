import React, { useCallback } from 'react';
import Modal from './Modal';

/**
 * Componente de diálogo de confirmación
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el diálogo está abierto
 * @param {Function} props.onClose - Función ejecutada al cerrar
 * @param {Function} props.onConfirm - Función ejecutada al confirmar
 * @param {string} props.title - Título del diálogo
 * @param {string} props.message - Mensaje de confirmación
 * @param {string} props.confirmText - Texto del botón de confirmación
 * @param {string} props.cancelText - Texto del botón de cancelar
 * @param {string} props.type - Tipo de confirmación ('danger', 'warning', 'info')
 * @param {React.ReactNode} props.icon - Icono personalizado
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  icon
}) => {
  /**
   * Configuración de estilos por tipo
   */
  const typeConfig = {
    danger: {
      icon: '🗑️',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBtn: 'btn-danger',
      title: 'text-red-900'
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500',
      title: 'text-yellow-900'
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBtn: 'btn-primary',
      title: 'text-blue-900'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  /**
   * Maneja la confirmación
   */
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  /**
   * Maneja la cancelación
   */
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icono */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
          <div className={`flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg}`}>
            <span className={`text-2xl ${config.iconColor}`}>
              {icon || config.icon}
            </span>
          </div>
        </div>

        {/* Título */}
        <h3 className={`text-lg font-medium mb-2 ${config.title}`}>
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-center">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary order-2 sm:order-1 w-full sm:w-auto"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${config.confirmBtn} order-1 sm:order-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog; 