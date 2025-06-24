import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Table, LoadingSpinner, Alert, Modal } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import { useConfirm } from '../../hooks/useConfirm';
import { getIntegrations, createIntegration, updateIntegration, deleteIntegration, regenerateApiSecret } from '../../services/authService';
import { MESSAGES, INTEGRATION_TYPES } from '../../constants';

/**
 * Página de administración de integraciones con sistemas externos
 */
const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    integration_type: INTEGRATION_TYPES.API_KEY,
    callback_url: '',
    configuration: {},
  });

  const { loading, error, execute } = useApi();
  const { confirm } = useConfirm();

  /**
   * Obtiene la lista de integraciones
   */
  const fetchIntegrations = useCallback(async () => {
    const data = await execute(getIntegrations);
    if (data) {
      setIntegrations(data);
    }
  }, [execute]);

  // Cargar integraciones al montar el componente
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  /**
   * Maneja cambios en el formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Abre el modal para crear una nueva integración
   */
  const handleOpenCreateModal = () => {
    setSelectedIntegration(null);
    setFormData({
      name: '',
      description: '',
      integration_type: INTEGRATION_TYPES.API_KEY,
      callback_url: '',
      configuration: {},
    });
    setIsModalOpen(true);
  };

  /**
   * Abre el modal para editar una integración existente
   */
  const handleOpenEditModal = (integration) => {
    setSelectedIntegration(integration);
    setFormData({
      name: integration.name,
      description: integration.description || '',
      integration_type: integration.integration_type,
      callback_url: integration.callback_url || '',
      is_active: integration.is_active,
    });
    setIsModalOpen(true);
  };

  /**
   * Cierra el modal y resetea el estado
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
    setIsSecretVisible(false);
  };

  /**
   * Maneja el envío del formulario para crear/actualizar integración
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedIntegration) {
        // Actualizar integración existente
        const updatedIntegration = await execute(() => 
          updateIntegration(selectedIntegration.id, formData)
        );
        
        if (updatedIntegration) {
          setIntegrations((prev) =>
            prev.map((item) =>
              item.id === updatedIntegration.id ? updatedIntegration : item
            )
          );
          handleCloseModal();
          setSuccess(MESSAGES.SUCCESS.UPDATE);
          setTimeout(() => setSuccess(''), 3000);
        }
      } else {
        // Crear nueva integración
        const newIntegration = await execute(() => createIntegration(formData));
        
        if (newIntegration) {
          setIntegrations((prev) => [...prev, newIntegration]);
          handleCloseModal();
          setSuccess(MESSAGES.SUCCESS.CREATE);
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  /**
   * Maneja la eliminación de una integración
   */
  const handleDelete = async (integration) => {
    const confirmed = await confirm({
      title: 'Delete Integration',
      message: `Are you sure you want to delete the integration "${integration.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: '🗑️'
    });

    if (confirmed) {
      try {
        await execute(() => deleteIntegration(integration.id));
        setIntegrations((prev) => prev.filter((item) => item.id !== integration.id));
        setSuccess(MESSAGES.SUCCESS.DELETE);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting integration:', error);
      }
    }
  };

  /**
   * Regenera el API secret para una integración
   */
  const handleRegenerateSecret = async (integration) => {
    const confirmed = await confirm({
      title: 'Regenerate API Secret',
      message: MESSAGES.CONFIRM.REGENERATE_SECRET,
      confirmText: 'Regenerate',
      cancelText: 'Cancel',
      type: 'warning',
      icon: '🔄'
    });

    if (confirmed) {
      try {
        const updatedIntegration = await execute(() => 
          regenerateApiSecret(integration.id)
        );
        
        if (updatedIntegration) {
          setIntegrations((prev) =>
            prev.map((item) =>
              item.id === updatedIntegration.id ? updatedIntegration : item
            )
          );
          
          // Mostrar el nuevo secreto
          setSelectedIntegration(updatedIntegration);
          setIsSecretVisible(true);
        }
      } catch (error) {
        console.error('Error regenerating API secret:', error);
      }
    }
  };

  /**
   * Columnas para la tabla de integraciones
   */
  const columns = [
    {
      header: 'Name',
      render: (integration) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">
              {integration.integration_type === INTEGRATION_TYPES.API_KEY ? '🔑' : 
               integration.integration_type === INTEGRATION_TYPES.OAUTH2 ? '🔐' : 
               integration.integration_type === INTEGRATION_TYPES.WEBHOOK ? '🔔' : '🔌'}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {integration.name}
            </div>
            <div className="text-sm text-gray-500">
              {integration.description || 'No description'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (integration) => (
        <div className="text-sm text-gray-900 capitalize">
          {integration.integration_type.replace('_', ' ')}
        </div>
      ),
    },
    {
      header: 'API Key',
      render: (integration) => (
        <div className="text-sm">
          <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
            {integration.api_key}
          </code>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (integration) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          integration.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {integration.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (integration) => (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => handleOpenEditModal(integration)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium transition-colors"
            title="Edit integration"
          >
            Edit
          </button>
          <button
            onClick={() => handleRegenerateSecret(integration)}
            className="text-yellow-600 hover:text-yellow-900 text-sm font-medium transition-colors"
            title="Regenerate API secret"
          >
            Regenerate
          </button>
          <button
            onClick={() => handleDelete(integration)}
            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
            title="Delete integration"
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
                <h1 className="text-2xl font-bold text-gray-900">External Integrations</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage integrations with external systems and services
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Integration
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
                API keys and secrets provide access to your account. Keep them secure and regenerate them if they're compromised.
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
            <LoadingSpinner size="lg" text="Loading integrations..." />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Active Integrations ({integrations.length})
              </h3>
            </div>
            {integrations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-4">🔌</div>
                <p className="text-lg font-medium mb-2">No integrations found</p>
                <p className="text-sm">Create your first integration to connect with external systems.</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={integrations}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
              />
            )}
          </div>
        )}

        {/* Modal para crear/editar integración */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedIntegration ? 'Edit Integration' : 'Create Integration'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="integration_type" className="block text-sm font-medium text-gray-700">
                Integration Type *
              </label>
              <select
                id="integration_type"
                name="integration_type"
                value={formData.integration_type}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                disabled={selectedIntegration} // No permitir cambiar el tipo en edición
              >
                <option value={INTEGRATION_TYPES.API_KEY}>API Key</option>
                <option value={INTEGRATION_TYPES.OAUTH2}>OAuth 2.0</option>
                <option value={INTEGRATION_TYPES.WEBHOOK}>Webhook</option>
                <option value={INTEGRATION_TYPES.CUSTOM}>Custom</option>
              </select>
            </div>

            <div>
              <label htmlFor="callback_url" className="block text-sm font-medium text-gray-700">
                Callback URL
              </label>
              <input
                type="url"
                id="callback_url"
                name="callback_url"
                value={formData.callback_url}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/callback"
              />
            </div>

            {selectedIntegration && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      value="true"
                      checked={formData.is_active === true}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2">Active</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      name="is_active"
                      value="false"
                      checked={formData.is_active === false}
                      onChange={() => setFormData({ ...formData, is_active: false })}
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
                {loading ? 'Saving...' : selectedIntegration ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal para mostrar el API secret regenerado */}
        <Modal
          isOpen={isSecretVisible && selectedIntegration}
          onClose={() => setIsSecretVisible(false)}
          title="API Secret Regenerated"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                  <div className="text-sm text-yellow-700 mt-1">
                    The API secret for <strong>{selectedIntegration?.name}</strong> has been regenerated. 
                    Please save this information securely as it will not be shown again.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={selectedIntegration?.api_key}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 bg-gray-50 text-gray-500 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selectedIntegration?.api_key)}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">API Secret</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={selectedIntegration?.api_secret}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 bg-gray-50 text-gray-500 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(selectedIntegration?.api_secret)}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsSecretVisible(false)}
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

export default Integrations; 