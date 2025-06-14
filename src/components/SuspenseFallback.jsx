import React from 'react';
import { LoadingSpinner } from './ui';

/**
 * Componente de fallback para React.Suspense
 * Proporciona una interfaz de carga consistente para lazy loading
 */
const SuspenseFallback = ({ className = "h-64" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner 
        size="xl" 
        text="Loading..." 
      />
    </div>
  );
};

export default SuspenseFallback; 