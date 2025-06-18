import React, { useState, useEffect } from 'react';
import { Table, LoadingSpinner, Alert, Modal, ConfirmDialog } from '../../components/ui';
import * as authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    company: null,
  });

  // Check if user is from root company
  const isRootUser = user?.is_superuser && user?.company_id === 1; // Assuming company_id 1 is the root company

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await authService.getCompanies();
      setCompanies(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setEditMode(false);
    setCurrentCompany(null);
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditMode(true);
      setCurrentCompany(company);
      setFormData({
        name: company.name,
        description: company.description || '',
        is_active: company.is_active,
      });
    } else {
      resetForm();
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode) {
        await authService.updateCompany(currentCompany.id, formData);
      } else {
        await authService.createCompany(formData);
      }
      
      await fetchCompanies();
      setShowModal(false);
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Error saving company:', error);
      setError(error.response?.data?.detail || 'Failed to save company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (company) => {
    setDeleteDialog({
      isOpen: true,
      company,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      company: null,
    });
  };

  const handleDeleteCompany = async () => {
    if (!deleteDialog.company) return;
    
    try {
      setLoading(true);
      await authService.deleteCompany(deleteDialog.company.id);
      await fetchCompanies();
      closeDeleteDialog();
      setError(null);
    } catch (error) {
      console.error('Error deleting company:', error);
      setError(error.response?.data?.detail || 'Failed to delete company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Special class for root company
  const getRootBadgeClass = (isRoot) => {
    return isRoot
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : '';
  };

  if (!isRootUser) {
    return (
      <div className="container mx-auto p-4">
        <Alert type="error" message="You do not have permission to access this page." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Companies Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Company
        </button>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {loading && !companies.length ? (
        <LoadingSpinner />
      ) : (
        <Table
          data={companies}
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Name', accessor: 'name' },
            { header: 'Description', accessor: 'description' },
            { 
              header: 'Status', 
              accessor: 'is_active',
              cell: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadgeClass(row.is_active)}`}>
                  {row.is_active ? 'Active' : 'Inactive'}
                </span>
              )
            },
            {
              header: 'Type',
              accessor: 'is_root',
              cell: (row) => (
                row.is_root && (
                  <span className={`px-2 py-1 rounded-full text-xs border ${getRootBadgeClass(row.is_root)}`}>
                    Root
                  </span>
                )
              )
            },
            {
              header: 'Actions',
              cell: (row) => (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(row)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  {!row.is_root && (
                    <button
                      onClick={() => openDeleteDialog(row)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          keyField="id"
          pagination
          pageSize={10}
        />
      )}

      {/* Company Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editMode ? 'Edit Company' : 'Create New Company'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label>Active</label>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        message={`Are you sure you want to delete ${deleteDialog.company?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Companies; 