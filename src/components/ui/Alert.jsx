import React from 'react';

/**
 * Reusable alert component
 * Shows messages of different types with consistent styles
 * @param {Object} props - Component properties
 * @param {string} props.type - Alert type ('success', 'error', 'warning', 'info')
 * @param {string} props.message - Message to display
 * @param {boolean} props.dismissible - If the alert can be dismissed
 * @param {Function} props.onClose - Function executed on alert close
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Custom content
 */
const Alert = ({ 
  type = 'info', 
  message, 
  dismissible = false, 
  onClose, 
  className = '',
  children 
}) => {
  // Don't render if there's no message or children
  if (!message && !children) return null;

  /**
   * Style configuration by alert type
   */
  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: '✅',
      iconColor: 'text-green-400',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: '❌',
      iconColor: 'text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: '⚠️',
      iconColor: 'text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ️',
      iconColor: 'text-blue-400',
    },
  };

  const currentStyle = alertStyles[type] || alertStyles.info;

  /**
   * Handles alert closing
   */
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`
        relative border rounded-md p-4 
        ${currentStyle.container} 
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0">
          <span 
            className={`text-lg ${currentStyle.iconColor}`}
            aria-hidden="true"
          >
            {currentStyle.icon}
          </span>
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {message && (
            <p className="text-sm font-medium">
              {message}
            </p>
          )}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}
        </div>

        {/* Close button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1.5 
                ${currentStyle.iconColor} 
                hover:bg-opacity-20 hover:bg-current
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-offset-transparent focus:ring-current
              `}
              aria-label="Close alert"
            >
              <svg 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;