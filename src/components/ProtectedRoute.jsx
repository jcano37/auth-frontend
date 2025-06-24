import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './ui';

/**
 * Component to protect routes that require authentication
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requireAdmin - If requires administrator permissions
 * @param {boolean} props.requireRoot - If requires being a root company user
 */
const ProtectedRoute = ({ children, requireAdmin = false, requireRoot = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show spinner while verifying authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Verifying authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
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