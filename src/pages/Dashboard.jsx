import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import * as authService from '../services/authService';

const Dashboard = () => {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch system stats for admin users
  useEffect(() => {
    if (user?.is_superuser) {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const stats = await authService.getActiveUsersStats();
          setSystemStats(stats);
        } catch (error) {
          console.error('Failed to fetch system stats:', error);
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    }
  }, [user?.is_superuser]);

  const stats = [
    {
      name: 'Account Status',
      value: user?.is_active ? 'Active' : 'Inactive',
      icon: '✅',
      color: user?.is_active ? 'text-green-600' : 'text-red-600',
    },
    {
      name: 'Email Verified',
      value: user?.is_verified ? 'Verified' : 'Pending',
      icon: '📧',
      color: user?.is_verified ? 'text-green-600' : 'text-yellow-600',
    },
    {
      name: 'Account Type',
      value: user?.is_superuser ? 'Administrator' : 'User',
      icon: '👤',
      color: user?.is_superuser ? 'text-purple-600' : 'text-blue-600',
    },
    {
      name: 'Member Since',
      value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
      icon: '📅',
      color: 'text-gray-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {(user?.full_name || user?.username)?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.full_name || user?.username}!
                </h1>
                <p className="text-sm text-gray-500">
                  {user?.email}
                </p>
                {user?.last_login && (
                  <p className="text-sm text-gray-500">
                    Last login: {new Date(user.last_login).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className={`text-lg font-medium ${stat.color}`}>
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Stats for Admins */}
        {user?.is_superuser && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Statistics
              </h3>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Loading statistics...</span>
                </div>
              ) : systemStats ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">👥</span>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Active Users (24h)</p>
                        <p className="text-2xl font-bold text-blue-900">{systemStats.active_users_24h}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔗</span>
                      <div>
                        <p className="text-sm font-medium text-green-600">Active Sessions</p>
                        <p className="text-2xl font-bold text-green-900">{systemStats.total_active_sessions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">👤</span>
                      <div>
                        <p className="text-sm font-medium text-purple-600">Total Users</p>
                        <p className="text-2xl font-bold text-purple-900">{systemStats.total_users}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🆕</span>
                      <div>
                        <p className="text-sm font-medium text-yellow-600">New Users (7d)</p>
                        <p className="text-2xl font-bold text-yellow-900">{systemStats.new_users_7d}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <p className="text-sm font-medium text-indigo-600">Sessions (24h)</p>
                        <p className="text-2xl font-bold text-indigo-900">{systemStats.active_sessions_24h}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load statistics
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="/profile"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 ring-4 ring-white">
                    <span className="text-xl">👤</span>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Update Profile
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your personal information and account settings.
                  </p>
                </div>
              </a>

              <a
                href="/my-sessions"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                    <span className="text-xl">🔐</span>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    My Sessions
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View and manage your active sessions across devices.
                  </p>
                </div>
              </a>

              {user?.is_superuser && (
                <>
                  <a
                    href="/admin/users"
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                        <span className="text-xl">👥</span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Manage Users
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Create, edit, and manage user accounts.
                      </p>
                    </div>
                  </a>

                  <a
                    href="/admin/roles"
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                        <span className="text-xl">🔐</span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Manage Roles
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Configure roles and permissions.
                      </p>
                    </div>
                  </a>

                  <a
                    href="/admin/sessions"
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-600 ring-4 ring-white">
                        <span className="text-xl">🌐</span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Active Sessions
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Monitor and manage system-wide active sessions.
                      </p>
                    </div>
                  </a>

                  <a
                    href="/admin/permissions"
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-600 ring-4 ring-white">
                        <span className="text-xl">🛡️</span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Manage Permissions
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Configure system permissions and access controls.
                      </p>
                    </div>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">User ID:</span>
                <span className="text-sm text-gray-900">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Username:</span>
                <span className="text-sm text-gray-900">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="text-sm text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Full Name:</span>
                <span className="text-sm text-gray-900">{user?.full_name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Account Created:</span>
                <span className="text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                <span className="text-sm text-gray-900">
                  {user?.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 