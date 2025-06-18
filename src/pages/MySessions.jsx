import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Table, Alert, ConfirmDialog } from '../components/ui';
import { useApiList, useApi } from '../hooks/useApi';
import { useConfirm } from '../hooks/useConfirm';
import * as authService from '../services/authService';
import { MESSAGES } from '../constants';

/**
 * Page to manage active sessions for the current user
 */
const MySessions = () => {
  const {
    data: sessions,
    loading,
    error,
    fetchData,
    removeItem,
    clearError
  } = useApiList();

  const { execute } = useApi();
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();
  const [success, setSuccess] = useState('');

  const fetchSessions = useCallback(async () => {
    await fetchData(() => authService.getCurrentUserSessions(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * Handles the revocation of a specific session
   */
  const handleRevokeSession = async (session) => {
    const confirmed = await confirm({
      title: 'Revoke Session',
      message: `Are you sure you want to revoke this session? You will be logged out from that device.`,
      confirmText: 'Revoke',
      cancelText: 'Cancel',
      type: 'warning',
      icon: '🚫'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.revokeSession(session.id),
          { successMessage: 'Session revoked successfully' }
        );
        removeItem(session.id);
        setSuccess('Session revoked successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Error is handled by useApi hook
      }
    }
  };

  /**
   * Handles revoking all sessions except the current one
   */
  const handleRevokeAllSessions = async () => {
    const confirmed = await confirm({
      title: 'Revoke All Other Sessions',
      message: `Are you sure you want to revoke all other sessions? You will be logged out from all other devices, but will remain logged in on this device.`,
      confirmText: 'Revoke All',
      cancelText: 'Cancel',
      type: 'warning',
      icon: '🚫'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.revokeAllSessions(),
          { successMessage: 'All other sessions revoked successfully' }
        );
        // Refresh the sessions list
        fetchSessions();
        setSuccess('All other sessions revoked successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Error is handled by useApi hook
      }
    }
  };

  /**
   * Formats the date in a readable way
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  /**
   * Gets more readable device information
   */
  const getDeviceInfo = (deviceInfo) => {
    if (!deviceInfo || deviceInfo === 'Unknown') return 'Unknown Device';
    
    // Extract basic information from the User-Agent
    if (deviceInfo.includes('Chrome')) return '🌐 Chrome Browser';
    if (deviceInfo.includes('Firefox')) return '🦊 Firefox Browser';
    if (deviceInfo.includes('Safari')) return '🧭 Safari Browser';
    if (deviceInfo.includes('Edge')) return '🔷 Edge Browser';
    if (deviceInfo.includes('Mobile')) return '📱 Mobile Device';
    
    return '💻 Desktop Browser';
  };

  /**
   * Determina si una sesión es la actual
   */
  const isCurrentSession = (session) => {
    // This is an approximation - in a real implementation you could
    // compare with the current token or have a server indicator
    const now = new Date();
    const sessionCreated = new Date(session.created_at);
    const timeDiff = Math.abs(now - sessionCreated);
    
    // If the session was created in the last 5 minutes, it is probably the current one
    return timeDiff < 5 * 60 * 1000;
  };

  /**
   * Column configuration for the sessions table
   */
  const columns = [
    {
      header: 'Device & Location',
      render: (session) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">
              {session.device_info?.includes('Mobile') ? '📱' : '💻'}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {getDeviceInfo(session.device_info)}
              {isCurrentSession(session) && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Current
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              IP: {session.ip_address || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Login Time',
      render: (session) => (
        <div className="text-sm text-gray-900">
          {formatDate(session.created_at)}
        </div>
      ),
    },
    {
      header: 'Expires',
      render: (session) => (
        <div className="text-sm text-gray-900">
          {formatDate(session.expires_at)}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (session) => {
        const isExpired = new Date(session.expires_at) < new Date();
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            session.is_active && !isExpired 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {session.is_active && !isExpired ? 'Active' : 'Expired'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (session) => (
        <div className="flex justify-end">
          {!isCurrentSession(session) && (
            <button
              onClick={() => handleRevokeSession(session)}
              className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
              title="Revoke this session"
            >
              Revoke
            </button>
          )}
          {isCurrentSession(session) && (
            <span className="text-sm text-gray-500">Current session</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Active Sessions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your active sessions across different devices and browsers
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleRevokeAllSessions}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              🚫 Revoke All Others
            </button>
            <button
              onClick={fetchSessions}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert type="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">🔒</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Review your active sessions regularly. If you see any sessions you don't recognize, 
                  revoke them immediately and consider changing your password.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Active Sessions ({sessions?.length || 0})
            </h3>
            
            <Table
              columns={columns}
              data={sessions}
              loading={loading}
              error={error}
              onRetry={() => {
                clearError();
                fetchSessions();
              }}
              emptyMessage="No active sessions found"
            />
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          icon={confirmState.icon}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      </div>
    </Layout>
  );
};

export default MySessions; 