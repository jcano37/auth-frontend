import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, ConfirmDialog, LoadingSpinner } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { MESSAGES, VALIDATION } from '../../constants';

/**
 * Companies administration page
 * Allows creating, editing, deleting, and listing companies
 * Only accessible by root users
 */
const Companies = () => {
  const {
    data: companies,
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
  const [editingCompany, setEditingCompany] = useState(null);
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Check if current user is from root company
  const isRootUser = currentUser?.is_superuser && currentUser?.company_id === 1;

  const fetchCompanies = useCallback(async () => {
    await fetchData(() => authService.getCompanies(), {
      errorMessage: MESSAGES.ERROR.FETCH
    });
  }, [fetchData]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  /**
   * Handles form submission (create/edit company)
   */
  const onSubmit = async (data) => {
    try {
      if (editingCompany) {
        const updatedCompany = await execute(
          () => authService.updateCompany(editingCompany.id, data),
          { successMessage: MESSAGES.SUCCESS.UPDATE }
        );
        updateItem(editingCompany.id, updatedCompany);
      } else {
        const newCompany = await execute(
          () => authService.createCompany(data),
          { successMessage: MESSAGES.SUCCESS.CREATE }
        );
        addItem(newCompany);
      }
      handleCloseModal();
      setSuccess(editingCompany ? MESSAGES.SUCCESS.UPDATE : MESSAGES.SUCCESS.CREATE);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Error is handled by useApi hook
    }
  };

  /**
   * Prepares the form to edit a company
   */
  const handleEdit = (company) => {
    setEditingCompany(company);
    reset({
      name: company.name,
      description: company.description || '',
      is_active: company.is_active,
    });
    setShowCreateModal(true);
  };

  /**
   * Handles company deletion with confirmation
   */
  const handleDelete = async (company) => {
    // Prevent deletion of root company
    if (company.is_root) {
      setSuccess('');
      setTimeout(() => {
        alert('Cannot delete the root company');
      }, 100);
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Company',
      message: `Are you sure you want to delete "${company.name}"? This action cannot be undone and will affect all users in this company.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      try {
        await execute(
          () => authService.deleteCompany(company.id),
          { successMessage: MESSAGES.SUCCESS.DELETE }
        );
        removeItem(company.id);
        setSuccess(MESSAGES.SUCCESS.DELETE);
        setTimeout(() => setSuccess(''), 3000);
      } catch {
        // Error is handled by useApi hook
      }
    }
  };

  /**
   * Closes the modal and resets the form
   */
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCompany(null);
    clearError();
    reset({
      name: '',
      description: '',
      is_active: true,
    });
  };

  /**
   * Column configuration for the companies table
   */
  const columns = [
    {
      header: 'Company',
      render: (company) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {company.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 flex items-center">
              {company.name}
              {company.is_root && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Root
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {company.description || 'No description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (company) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          company.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {company.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      render: (company) => (
        <div className="text-sm text-gray-900">
          {new Date(company.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (company) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEdit(company)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
            title="Edit company"
          >
            Edit
          </button>
          {!company.is_root && (
            <button
              onClick={() => handleDelete(company)}
              className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
              title="Delete company"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  // Show access denied for non-root users
  if (!isRootUser) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-xl">🚫</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Access Denied
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>You do not have permission to access company management. This feature is only available to root administrators.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Companies Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage companies and their settings across the system
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              ➕ Create Company
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert type="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Companies Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              All Companies
            </h3>
            
            <Table
              columns={columns}
              data={companies}
              loading={loading}
              error={error}
              onRetry={() => {
                clearError();
                fetchCompanies();
              }}
              emptyMessage="No companies found"
            />
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingCompany ? 'Edit Company' : 'Create New Company'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                {...register('name', { 
                  required: 'Company name is required',
                  minLength: {
                    value: 2,
                    message: 'Company name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Company name cannot exceed 100 characters'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="Enter company name"
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters'
                  }
                })}
                rows={3}
                className="form-input"
                placeholder="Enter company description (optional)"
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Company is active
              </label>
            </div>

            {/* Form Actions */}
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
                {editingCompany ? 'Update Company' : 'Create Company'}
              </button>
            </div>
          </form>
        </Modal>

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

export default Companies; 