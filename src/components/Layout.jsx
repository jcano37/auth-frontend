import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner, ConfirmDialog } from './ui';
import { useConfirm } from '../hooks/useConfirm';
import { ROUTES, MESSAGES } from '../constants';
import Logo from './Logo';

/**
 * Componente de layout principal
 * Proporciona la estructura base con sidebar y header
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido a renderizar
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Maneja el proceso de logout con confirmación
   */
  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'warning',
      icon: '👋'
    });

    if (confirmed) {
      try {
        await logout();
        navigate(ROUTES.LOGIN);
      } catch (error) {
        console.error('Logout error:', error);
        // Force navigation even if server logout fails
        navigate(ROUTES.LOGIN);
      }
    }
  };

  /**
   * Navigation configuration based on user permissions
   */
  const navigation = [
    { 
      name: 'Dashboard', 
      href: ROUTES.DASHBOARD, 
      icon: '🏠',
      description: 'Main dashboard'
    },
    { 
      name: 'Profile', 
      href: ROUTES.PROFILE, 
      icon: '👤',
      description: 'My profile'
    },
    { 
      name: 'My Sessions', 
      href: ROUTES.MY_SESSIONS, 
      icon: '🔐',
      description: 'My active sessions'
    },
    // Admin routes only for superusers
    ...(user?.is_superuser ? [
      { 
        name: 'Users', 
        href: ROUTES.ADMIN.USERS, 
        icon: '👥',
        description: 'User management'
      },
      { 
        name: 'Roles', 
        href: ROUTES.ADMIN.ROLES, 
        icon: '🔑',
        description: 'Role management'
      },
      { 
        name: 'Permissions', 
        href: ROUTES.ADMIN.PERMISSIONS, 
        icon: '⚙️',
        description: 'Permission management'
      },
      { 
        name: 'Active Sessions', 
        href: ROUTES.ADMIN.SESSIONS, 
        icon: '🌐',
        description: 'System active sessions'
      },
      { 
        name: 'Integrations', 
        href: ROUTES.ADMIN.INTEGRATIONS, 
        icon: '🔌',
        description: 'External system integrations'
      },
      // Companies management only for root users
      ...(user?.is_superuser && user?.company_id === 1 ? [
        {
          name: 'Companies', 
          href: ROUTES.ADMIN.COMPANIES, 
          icon: '🏢',
          description: 'Company management'
        }
      ] : [])
    ] : []),
  ];

  /**
   * Gets the current page name
   */
  const getCurrentPageName = () => {
    const currentPage = navigation.find(item => item.href === location.pathname);
    return currentPage?.name || 'Dashboard';
  };

  /**
   * Gets the user's initials for the avatar
   */
  const getUserInitials = () => {
    const name = user?.full_name || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  /**
   * Reusable navigation component
   */
  const NavigationItems = ({ isMobile = false }) => (
    <nav className={`${isMobile ? 'mt-5 px-2 space-y-1' : 'mt-5 flex-1 px-2 bg-white space-y-1'}`}>
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`${
            location.pathname === item.href
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } group flex items-center px-2 py-2 ${
            isMobile ? 'text-base' : 'text-sm'
          } font-medium rounded-md transition-colors duration-150`}
          onClick={() => isMobile && setSidebarOpen(false)}
          title={item.description}
        >
          <span className="mr-3 text-lg" aria-hidden="true">
            {item.icon}
          </span>
          {item.name}
        </Link>
      ))}
    </nav>
  );

  // Show spinner if loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading application..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        
        {/* Sidebar panel */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                      {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <span className="text-white text-xl" aria-hidden="true">×</span>
            </button>
          </div>
          
                      {/* Sidebar content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto custom-scrollbar">
            {/* Logo/Título */}
            <div className="flex-shrink-0 flex items-center px-4">
              <Logo size="md" showText={true} />
            </div>
            
                          {/* Navigation */}
              <NavigationItems isMobile={true} />
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto custom-scrollbar">
            {/* Logo/Título */}
            <div className="flex items-center flex-shrink-0 px-4">
              <Logo size="md" showText={true} />
            </div>
            
            {/* Navigation */}
            <NavigationItems />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile menu button */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="text-xl" aria-hidden="true">☰</span>
          </button>
        </div>

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Page title */}
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getCurrentPageName()}
                </h2>
              </div>
              
              {/* User information and logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Welcome, {user?.full_name || user?.username}
                  </span>
                  <div 
                    className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                    title={user?.full_name || user?.username}
                  >
                    <span className="text-white text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        icon={confirmState.icon}
      />
    </div>
  );
};

export default Layout;