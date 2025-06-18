import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './ui';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {boolean} props.requireAdmin - Si requiere permisos de administrador
 * @param {boolean} props.requireRoot - Si requiere ser usuario de la empresa root
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireRoot = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Verifying authentication..." />
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirigir a dashboard si requiere admin y no es admin
  if (requireAdmin && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Check if root access is required (company id 1 is assumed to be the root company)
  if (requireRoot && (!user?.is_superuser || user?.company_id !== 1)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 