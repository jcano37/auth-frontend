import React from 'react';

/**
 * Componente de logo de la empresa
 * Muestra el logo de Vite con el nombre de la empresa de forma profesional
 */
const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo de Vite */}
      <div className="flex-shrink-0">
        <img
          src="/vite.svg"
          alt="Jcano Auth Logo"
          className={`${sizeClasses[size]} transition-transform duration-200 hover:scale-110`}
        />
      </div>
      
      {/* Nombre de la empresa */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-gray-900 leading-tight`}>
            Jcano Auth
          </h1>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            SECURE PLATFORM
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 