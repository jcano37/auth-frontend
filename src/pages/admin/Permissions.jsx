import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert } from '../../components/ui';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { MESSAGES } from '../../constants';

const Permissions = () => {
  const {
    data: permissions,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    removeItem,
    clearError
  } = useApiList();

  const { execute } = useApi();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    await fetchData(() => authService.getPermissions(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  };

  const onSubmit = async (data) => {
    try {
      if (editingPermission) {
        const updatedPermission = await execute(
          () => authService.updatePermission(editingPermission.id, data),
          { successMessage: MESSAGES.SUCCESS.UPDATE }
        );
        updateItem(editingPermission.id, updatedPermission);
      } else {
        const newPermission = await execute(
          () => authService.createPermission(data),
          { successMessage: MESSAGES.SUCCESS.CREATE }
        );
        addItem(newPermission);
      }
      handleCloseModal();
      setSuccess(editingPermission ? MESSAGES.SUCCESS.UPDATE : MESSAGES.SUCCESS.CREATE);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Error is handled by useApi hook
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    reset({
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (permission) => {
    const confirmed = await confirm({
      title: 'Delete Permission',
      message: `Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.deletePermission(permission.id),
          { successMessage: MESSAGES.SUCCESS.DELETE }
        );
        removeItem(permission.id);
        setSuccess(MESSAGES.SUCCESS.DELETE);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        // Error is handled by useApi hook
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPermission(null);
    clearError();
    reset({
      name: '',
      description: '',
      resource: '',
      action: '',
    });
  };

  const columns = [
    {
      header: 'Permission',
      accessor: 'name',
      render: (permission) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
          <div className="text-sm text-gray-500">{permission.description}</div>
        </div>
      ),
    },
    {
      header: 'Resource',
      accessor: 'resource',
      render: (permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {permission.resource || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {permission.action || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (permission) => new Date(permission.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (permission) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(permission)}
            className="text-primary-600 hover:text-primary-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(permission)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const actionOptions = [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'manage', label: 'Manage' },
    { value: 'view', label: 'View' },
    { value: 'edit', label: 'Edit' },
  ];

  const resourceOptions = [
    { value: 'users', label: 'Users' },
    { value: 'roles', label: 'Roles' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'profile', label: 'Profile' },
    { value: 'settings', label: 'Settings' },
    { value: 'reports', label: 'Reports' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Permission
          </button>
        </div>

        {/* Alerts */}
        <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
        <Alert type="error" message={error} dismissible onClose={clearError} />

        {/* Permissions Table */}
        <Table
          data={permissions}
          columns={columns}
          loading={loading}
          emptyMessage="No permissions found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingPermission ? 'Edit Permission' : 'Create New Permission'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                placeholder="e.g., users:create"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe what this permission allows"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Resource</label>
                <select
                  {...register('resource')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select resource</option>
                  {resourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <select
                  {...register('action')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select action</option>
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Permission Naming Convention
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Use the format: <code>resource:action</code> (e.g., users:create, roles:delete)</p>
                  </div>
                </div>
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
              <button type="submit" className="btn-primary">
                {editingPermission ? 'Update' : 'Create'}
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

export default Permissions; 