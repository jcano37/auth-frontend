import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, ConfirmDialog, LoadingSpinner } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { MESSAGES } from '../../constants';

/**
 * User administration page
 * Allows creating, editing, deleting, and listing users
 */
const Users = () => {
  const {
    data: users,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    removeItem,
    clearError
  } = useApiList();

  const { user: currentUser } = useAuth();
  const { execute } = useApi();
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [success, setSuccess] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Check if current user is from root company
  const isRootUser = currentUser?.is_superuser && currentUser?.company_id === 1;

  const fetchUsers = useCallback(async () => {
    await fetchData(() => authService.getUsers(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  // Fetch companies if root user
  const fetchCompanies = useCallback(async () => {
    if (isRootUser) {
      try {
        setLoadingCompanies(true);
        const data = await authService.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    }
  }, [isRootUser]);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  /**
   * Handles form submission (create/edit user)
   */
  const onSubmit = async (data) => {
    try {
      // Ensure company_id is a number
      if (data.company_id) {
        data.company_id = parseInt(data.company_id, 10);
      } else if (!editingUser) {
        // Set company_id to current user's company if not set and creating new user
        data.company_id = currentUser?.company_id || 1;
      }
      
      if (editingUser) {
        const updatedUser = await execute(
          () => authService.updateUser(editingUser.id, data),
          { successMessage: MESSAGES.SUCCESS.UPDATE }
        );
        updateItem(editingUser.id, updatedUser);
      } else {
        const newUser = await execute(
          () => authService.createUser(data),
          { successMessage: MESSAGES.SUCCESS.CREATE }
        );
        addItem(newUser);
      }
      handleCloseModal();
      setSuccess(editingUser ? MESSAGES.SUCCESS.UPDATE : MESSAGES.SUCCESS.CREATE);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Error is handled by useApi hook
    }
  };

  /**
   * Prepares the form to edit a user
   */
  const handleEdit = (user) => {
    setEditingUser(user);
    reset({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      company_id: user.company_id,
    });
    setShowCreateModal(true);
  };

  /**
   * Handles user deletion with confirmation
   */
  const handleDelete = async (user) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.full_name || user.username}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.deleteUser(user.id),
          { successMessage: MESSAGES.SUCCESS.DELETE }
        );
        removeItem(user.id);
        setSuccess(MESSAGES.SUCCESS.DELETE);
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Error is handled by useApi hook
      }
    }
  };

  /**
   * Cierra el modal y resetea el formulario
   */
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    clearError();
    reset({
      email: '',
      username: '',
      full_name: '',
      password: '',
      is_active: true,
      is_superuser: false,
      company_id: currentUser?.company_id || 1,
    });
  };

  /**
   * Get company name by ID
   */
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown';
  };

  /**
   * Column configuration for the table
   */
  const columns = [
    {
      header: 'User',
      render: (user) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {(user.full_name || user.username)?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.full_name || user.username}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    ...(isRootUser ? [
      {
        header: 'Company',
        render: (user) => (
          <span className="text-sm text-gray-600">
            {getCompanyName(user.company_id)}
          </span>
        )
      }
    ] : []),
    {
      header: 'Status',
      render: (user) => (
        <div className="flex space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.is_verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.is_superuser ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.is_superuser ? 'Administrator' : 'User'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (user) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(user)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium transition-colors"
            title="Edit user"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
            title="Delete user"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </button>
        </div>

        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message={success} className="mb-4" />}

        {loading ? (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        ) : (
          <Table
            data={users}
            columns={columns}
            emptyMessage="No users found"
          />
        )}

        {/* Create/Edit User Modal */}
        <Modal 
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingUser ? 'Edit User' : 'Create New User'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Username</label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register('full_name')}
              />
            </div>

            {!editingUser && (
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Company selection (only for root users) */}
            {isRootUser && (
              <div>
                <label className="block mb-1">Company</label>
                {loadingCompanies ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    {...register('company_id')}
                  >
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                {...register('is_active')}
              />
              <label htmlFor="is_active">Active</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_superuser"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                {...register('is_superuser')}
              />
              <label htmlFor="is_superuser">Administrator</label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirm Dialog */}
        <ConfirmDialog
          {...confirmState}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
        />
      </div>
    </Layout>
  );
};

export default Users; 