import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import { Modal, Table, Alert, LoadingSpinner } from '../../components/ui';
import { useApiList, useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import * as authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { MESSAGES } from '../../constants';

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
  const { confirm } = useConfirm();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

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
          <div className="flex-shrink-0">
            <span className="text-2xl">🏢</span>
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
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleEdit(company)}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium transition-colors"
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
        {/* Header section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Create, manage, and configure organizations in your system
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Company
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
                Companies define the organizational structure of your system. Manage them carefully.
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
            <LoadingSpinner size="lg" text="Loading companies..." />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Active Companies ({companies.length})
              </h3>
            </div>
            {companies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-4">🏢</div>
                <p className="text-lg font-medium mb-2">No companies found</p>
                <p className="text-sm">Create your first company to get started.</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={companies}
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
          title={editingCompany ? 'Edit Company' : 'Create Company'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { 
                  required: 'Company name is required',
                  validate: {
                    minLength: value => value.length >= 2 || 'Company name must be at least 2 characters',
                    maxLength: value => value.length <= 100 || 'Company name must be less than 100 characters'
                  }
                })}
                placeholder="e.g., Acme Corporation"
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
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description must be less than 500 characters'
                  }
                })}
                rows="3"
                placeholder="Optional description of the company"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {editingCompany && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register('is_active')}
                      value="true"
                      checked={watch('is_active') === true}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2">Active</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      {...register('is_active')}
                      value="false"
                      checked={watch('is_active') === false}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2">Inactive</span>
                  </label>
                </div>
              </div>
            )}

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
                {loading ? 'Saving...' : editingCompany ? 'Update Company' : 'Create Company'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Companies; 