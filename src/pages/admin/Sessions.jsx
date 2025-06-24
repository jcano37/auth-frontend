import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Table, Alert, ConfirmDialog } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { MESSAGES } from '../../constants';

/**
 * Active sessions administration page
 * Permite ver estadísticas del sistema y gestionar sesiones activas
 */
const Sessions = () => {
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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchSessions = useCallback(async () => {
    await fetchData(() => authService.getActiveSessions(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await authService.getActiveUsersStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [fetchSessions, fetchStats]);

  /**
   * Handles session revocation with confirmation
   */
  const handleRevokeSession = async (session) => {
    const confirmed = await confirm({
      title: 'Revoke Session',
      message: `Are you sure you want to revoke this session? The user will be logged out immediately.`,
      confirmText: 'Revoke',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🚫'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.adminRevokeSession(session.id),
          { successMessage: 'Session revoked successfully' }
        );
        removeItem(session.id);
        setSuccess('Session revoked successfully');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh stats after revoking
        fetchStats();
      } catch {
        // Error es manejado por useApi hook
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
   * Gets device information in a more readable way
   */
  const getDeviceInfo = (deviceInfo) => {
    if (!deviceInfo || deviceInfo === 'Unknown') return 'Unknown Device';
    
    // Extract basic information from User-Agent
    if (deviceInfo.includes('Chrome')) return '🌐 Chrome Browser';
    if (deviceInfo.includes('Firefox')) return '🦊 Firefox Browser';
    if (deviceInfo.includes('Safari')) return '🧭 Safari Browser';
    if (deviceInfo.includes('Edge')) return '🔷 Edge Browser';
    if (deviceInfo.includes('Mobile')) return '📱 Mobile Device';
    
    return '💻 Desktop Browser';
  };

  /**
   * Column configuration for the sessions table
   */
  const columns = [
    {
      header: 'User',
      render: (session) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {session.user_id}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              User ID: {session.user_id}
            </div>
            <div className="text-sm text-gray-500">
              {session.ip_address || 'Unknown IP'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Device',
      render: (session) => (
        <div className="text-sm text-gray-900">
          {getDeviceInfo(session.device_info)}
        </div>
      ),
    },
    {
      header: 'Created',
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
        <button
          onClick={() => handleRevokeSession(session)}
          className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
          title="Revoke session"
        >
          Revoke
        </button>
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
              Active Sessions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage active user sessions across the system
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => {
                fetchSessions();
                fetchStats();
              }}
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

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading statistics...</span>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Users (24h)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.active_users_24h}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Sessions (24h)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.active_sessions_24h}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Active Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_active_sessions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_users}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🆕</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        New Users (7d)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.new_users_7d}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Sessions Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Active Sessions
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

export default Sessions;