import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import * as authService from '../../services/authService';
import { MESSAGES } from '../../constants';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useConfirm } from '../../hooks/useConfirm';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [success, setSuccess] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const { confirmState, confirm, closeConfirm, handleConfirm } = useConfirm();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    await fetchData(() => authService.getRoles(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  };

  const fetchPermissions = async () => {
    try {
      const data = await authService.getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

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
    } catch (err) {
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
      } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
      accessor: 'name',
      render: (role) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{role.name}</div>
          <div className="text-sm text-gray-500">{role.description}</div>
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
      accessor: 'created_at',
      render: (role) => new Date(role.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (role) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleManagePermissions(role)}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            Permissions
          </button>
          <button
            onClick={() => handleEdit(role)}
            className="text-primary-600 hover:text-primary-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(role)}
            className="text-red-600 hover:text-red-900 text-sm"
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
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Role
          </button>
        </div>

        {/* Alerts */}
        <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
        <Alert type="error" message={error} dismissible onClose={clearError} />

        {/* Roles Table */}
        <Table
          data={roles}
          columns={columns}
          loading={loading}
          emptyMessage="No roles found"
        />

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingRole ? 'Edit Role' : 'Create New Role'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
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
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Permissions Management Modal */}
        <Modal
          isOpen={showPermissionsModal}
          onClose={handleClosePermissionsModal}
          title={`Manage Permissions - ${selectedRole?.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Permissions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedRole?.permissions?.length > 0 ? (
                  selectedRole.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{permission.name}</span>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePermission(permission.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No permissions assigned</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Available Permissions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {permissions
                  .filter(permission => !selectedRole?.permissions?.some(p => p.id === permission.id))
                  .map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{permission.name}</span>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <button
                        onClick={() => handleAssignPermission(permission.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
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

export default Roles; 