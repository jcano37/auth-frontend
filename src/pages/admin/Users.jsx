import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, ConfirmDialog } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
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

  const { execute } = useApi();
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const fetchUsers = useCallback(async () => {
    await fetchData(() => authService.getUsers(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handles form submission (create/edit user)
   */
  const onSubmit = async (data) => {
    try {
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
    });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create User
          </button>
        </div>

        {/* Alerts */}
        <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
        <Alert type="error" message={error} dismissible onClose={clearError} />

        {/* Users Table */}
        <Table
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingUser ? 'Edit User' : 'Create New User'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                type="text"
                className="form-input"
                placeholder="Enter full name"
              />
              {errors.full_name && (
                <p className="form-error">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Username</label>
              <input
                {...register('username', { required: 'Username is required' })}
                type="text"
                className="form-input"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="form-input"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {!editingUser && (
              <div>
                <label className="form-label">Password</label>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('is_superuser')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Administrator
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>

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
    </Layout>
  );
};

export default Users; 