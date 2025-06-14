import React from 'react';

/**
 * Componente de spinner de carga reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {string} props.size - Tamaño del spinner ('sm', 'md', 'lg', 'xl')
 * @param {string} props.color - Color del spinner
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.text - Texto opcional a mostrar
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'border-primary-600', 
  className = '', 
  text = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${color}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 