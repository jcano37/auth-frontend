import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();

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

        {/* Stats Grid */}
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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