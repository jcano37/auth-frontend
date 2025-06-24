import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, LoadingSpinner } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { MESSAGES } from '../../constants';

const Roles = () => {
  const {
    data: roles,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    removeItem,
    clearError
  } = useApiList();

  const { execute } = useApi();
  const { confirm } = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const fetchRoles = useCallback(async () => {
    await fetchData(() => authService.getRoles(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  const fetchPermissions = useCallback(async () => {
    try {
      const data = await authService.getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const onSubmit = async (data) => {
    try {
      if (editingRole) {
        const updatedRole = await execute(
          () => authService.updateRole(editingRole.id, data),
          { successMessage: MESSAGES.SUCCESS.UPDATE }
        );
        updateItem(editingRole.id, updatedRole);
      } else {
        const newRole = await execute(
          () => authService.createRole(data),
          { successMessage: MESSAGES.SUCCESS.CREATE }
        );
        addItem(newRole);
      }
      handleCloseModal();
      setSuccess(editingRole ? MESSAGES.SUCCESS.UPDATE : MESSAGES.SUCCESS.CREATE);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Error is handled by useApi hook
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    reset({
      name: role.name,
      description: role.description,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (role) => {
    const confirmed = await confirm({
      title: 'Delete Role',
      message: `Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.deleteRole(role.id),
          { successMessage: MESSAGES.SUCCESS.DELETE }
        );
        removeItem(role.id);
        setSuccess(MESSAGES.SUCCESS.DELETE);
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Error is handled by useApi hook
      }
    }
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const handleAssignPermission = async (permissionId) => {
    try {
      const updatedRole = await execute(
        () => authService.assignPermissionToRole(selectedRole.id, permissionId),
        { successMessage: 'Permission assigned successfully' }
      );
      updateItem(selectedRole.id, updatedRole);
      setSelectedRole(updatedRole);
    } catch {
      // Error is handled by useApi hook
    }
  };

  const handleRemovePermission = async (permissionId) => {
    try {
      const updatedRole = await execute(
        () => authService.removePermissionFromRole(selectedRole.id, permissionId),
        { successMessage: 'Permission removed successfully' }
      );
      updateItem(selectedRole.id, updatedRole);
      setSelectedRole(updatedRole);
    } catch {
      // Error is handled by useApi hook
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingRole(null);
    clearError();
    reset({
      name: '',
      description: '',
    });
  };

  const handleClosePermissionsModal = () => {
    setShowPermissionsModal(false);
    setSelectedRole(null);
  };

  const columns = [
    {
      header: 'Role',
      render: (role) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{role.name}</div>
            <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Permissions',
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions?.slice(0, 3).map((permission) => (
            <span
              key={permission.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {permission.name}
            </span>
          ))}
          {role.permissions?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{role.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Created',
      render: (role) => (
        <div className="text-sm text-gray-900">
          {new Date(role.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (role) => (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleManagePermissions(role)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
          >
            Permissions
          </button>
          <button
            onClick={() => handleEdit(role)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(role)}
            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
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
        {/* Header section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create, manage, and assign roles for your organization
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Role
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
                Roles define the permissions and access levels for users in your system. Manage them carefully.
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
            <LoadingSpinner size="lg" text="Loading roles..." />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Active Roles ({roles.length})
              </h3>
            </div>
            {roles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-4">🛡️</div>
                <p className="text-lg font-medium mb-2">No roles found</p>
                <p className="text-sm">Create your first role to define access levels.</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={roles}
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
          title={editingRole ? 'Edit Role' : 'Create Role'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Role name is required' })}
                placeholder="e.g., Admin, Manager, Viewer"
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
                placeholder="Optional description of the role's purpose"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
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
                {loading ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Permissions Management Modal */}
        <Modal
          isOpen={showPermissionsModal}
          onClose={handleClosePermissionsModal}
          title={`Manage Permissions for ${selectedRole?.name}`}
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-lg">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Current Permissions</h3>
                  <div className="text-sm text-blue-700 mt-1">
                    Manage the permissions assigned to this role.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRole?.permissions?.map((permission) => (
                  <span
                    key={permission.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {permission.name}
                    <button
                      onClick={() => handleRemovePermission(permission.id)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Permissions</h4>
              <div className="grid grid-cols-2 gap-2">
                {permissions
                  .filter(
                    (perm) => 
                      !selectedRole?.permissions?.some(
                        (rolePerm) => rolePerm.id === perm.id
                      )
                  )
                  .map((permission) => (
                    <button
                      key={permission.id}
                      onClick={() => handleAssignPermission(permission.id)}
                      className="text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {permission.name}
                    </button>
                  ))
                }
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleClosePermissionsModal}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Roles; 