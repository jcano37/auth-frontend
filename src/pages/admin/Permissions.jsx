import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, LoadingSpinner } from '../../components/ui';
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
  const [resourceTypes, setResourceTypes] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { confirm } = useConfirm();

  const fetchPermissions = useCallback(async () => {
    await fetchData(() => authService.getPermissions(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  const fetchResourceTypes = useCallback(async () => {
    try {
      const types = await authService.getResourceTypes();
      setResourceTypes(types);
    } catch (error) {
      console.error('Error fetching resource types:', error);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    fetchResourceTypes();
  }, [fetchPermissions, fetchResourceTypes]);

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
    } catch {
      // Error is handled by useApi hook
    }
  };

  const handleEdit = (permission) => {
    setEditingPermission(permission);
    reset({
      name: permission.name,
      description: permission.description,
      resource_type_id: permission.resource_type_id,
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
      } catch {
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
      resource_type_id: '',
      action: '',
    });
  };

  const columns = [
    {
      header: 'Permission',
      render: (permission) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">🔐</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{permission.name}</div>
            <div className="text-sm text-gray-500">{permission.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Resource',
      render: (permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {permission.resource || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (permission) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {permission.action || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (permission) => (
        <div className="text-sm text-gray-900">
          {new Date(permission.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (permission) => (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleEdit(permission)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(permission)}
            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Define and manage granular access controls for your system
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Permission
              </button>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-lg">🔒</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <div className="text-sm text-blue-700 mt-1">
                Permissions define the specific actions users can perform on resources. Configure them carefully.
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <Alert type="success" message={success} className="mb-4" />
        )}

        {/* Error message */}
        {error && <Alert type="error" message={error} className="mb-4" />}

        {/* Content section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading permissions..." />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Active Permissions ({permissions.length})
              </h3>
            </div>
            {permissions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-lg font-medium mb-2">No permissions found</p>
                <p className="text-sm">Create your first permission to define access controls.</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={permissions}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingPermission ? 'Edit Permission' : 'Create Permission'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Permission Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Permission name is required' })}
                placeholder="e.g., users:create"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows="3"
                placeholder="Describe what this permission allows"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="resource_type_id" className="block text-sm font-medium text-gray-700">
                  Resource Type
                </label>
                <select
                  id="resource_type_id"
                  {...register('resource_type_id', { required: 'Resource type is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Resource Type</option>
                  {resourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.resource_type_id && (
                  <p className="mt-2 text-sm text-red-600">{errors.resource_type_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                  Action *
                </label>
                <select
                  id="action"
                  {...register('action', { required: 'Action is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Action</option>
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.action && (
                  <p className="mt-2 text-sm text-red-600">{errors.action.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingPermission ? 'Update Permission' : 'Create Permission'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Permissions; 