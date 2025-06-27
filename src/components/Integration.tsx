import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Refresh, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Github,
  Database,
  FileText,
  Cloud,
  Zap
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'backup' | 'writing_assistant' | 'grammar_checker' | 'cloud_storage' | 'version_control';
  status: 'connected' | 'pending' | 'error';
  description: string;
  icon: string;
  config?: Record<string, any>;
  lastSync?: Date;
  errorMessage?: string;
  isBuiltIn?: boolean;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  type: Integration['type'];
  description: string;
  icon: string;
  configSchema: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'boolean';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    id: 'github',
    name: 'GitHub',
    type: 'version_control',
    description: 'Backup your work to GitHub repositories',
    icon: 'github',
    configSchema: [
      { key: 'token', label: 'GitHub Token', type: 'password', required: true, placeholder: 'ghp_...' },
      { key: 'repository', label: 'Repository', type: 'text', required: true, placeholder: 'username/repo' },
      { key: 'branch', label: 'Branch', type: 'text', required: false, placeholder: 'main' }
    ]
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    type: 'cloud_storage',
    description: 'Sync and backup your writing to Google Drive',
    icon: 'cloud',
    configSchema: [
      { key: 'folder', label: 'Folder Name', type: 'text', required: false, placeholder: 'WritersSpace Backup' },
      { key: 'autoSync', label: 'Auto Sync', type: 'boolean', required: false }
    ]
  },
  {
    id: 'grammarly',
    name: 'Grammarly API',
    type: 'grammar_checker',
    description: 'Enhanced grammar and style checking',
    icon: 'filetext',
    configSchema: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Enter your Grammarly API key' }
    ]
  },
  {
    id: 'notion',
    name: 'Notion',
    type: 'backup',
    description: 'Export your work to Notion databases',
    icon: 'database',
    configSchema: [
      { key: 'token', label: 'Integration Token', type: 'password', required: true },
      { key: 'databaseId', label: 'Database ID', type: 'text', required: true }
    ]
  }
];

interface IntegrationProps {
  onBack: () => void;
}

const Integration: React.FC<IntegrationProps> = ({ onBack }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Auto-Save',
      type: 'backup',
      status: 'connected',
      description: 'Automatically saves your work locally every few seconds',
      icon: 'database',
      isBuiltIn: true,
      lastSync: new Date()
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const getIntegrationIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5 text-gray-600" };
    switch (iconName) {
      case 'github': return <Github {...iconProps} />;
      case 'cloud': return <Cloud {...iconProps} />;
      case 'database': return <Database {...iconProps} />;
      case 'filetext': return <FileText {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      default: return <Settings {...iconProps} />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    const iconProps = { className: "w-3 h-3" };
    switch (status) {
      case 'connected': return <CheckCircle {...iconProps} />;
      case 'pending': return <Clock {...iconProps} />;
      case 'error': return <XCircle {...iconProps} />;
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const openConfigModal = (template: IntegrationTemplate, integration?: Integration) => {
    setSelectedTemplate(template);
    setEditingIntegration(integration || null);
    setConfig(integration?.config || {});
    setShowAddModal(false);
    setShowConfigModal(true);
  };

  const testConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected' as const, lastSync: new Date(), errorMessage: undefined }
          : integration
      ));
      setTestingConnection(null);
    }, 2000);
  };

  const saveIntegration = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const missingFields = selectedTemplate.configSchema
      .filter(field => field.required && !config[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    const integrationData: Integration = {
      id: editingIntegration?.id || Date.now().toString(),
      name: selectedTemplate.name,
      type: selectedTemplate.type,
      status: 'pending',
      description: selectedTemplate.description,
      icon: selectedTemplate.icon,
      config: { ...config }
    };

    if (editingIntegration) {
      // Update existing integration
      setIntegrations(prev => prev.map(integration =>
        integration.id === editingIntegration.id ? integrationData : integration
      ));
    } else {
      // Add new integration
      setIntegrations(prev => [...prev, integrationData]);
    }

    // Test connection automatically
    setTimeout(() => testConnection(integrationData.id), 500);

    setShowConfigModal(false);
    setSelectedTemplate(null);
    setEditingIntegration(null);
    setConfig({});
  };

  const deleteIntegration = (id: string) => {
    if (confirm('Are you sure you want to remove this integration?')) {
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    }
  };

  const syncIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, status: 'pending' as const }
        : integration
    ));

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === id
          ? { ...integration, status: 'connected' as const, lastSync: new Date() }
          : integration
      ));
    }, 1500);
  };

  return (
    <div className="flex-1 bg-white rounded-t-[17px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">Connect external services to enhance your writing workflow</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Back to Settings
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Integration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {integrations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations configured</h3>
              <p className="text-gray-600 mb-6">Connect services to backup your work, enhance your writing, and streamline your workflow</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
              >
                Add Your First Integration
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
                      {getIntegrationIcon(integration.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {getStatusIcon(integration.status)}
                          <span className="capitalize">{integration.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{integration.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">Type: {integration.type.replace('_', ' ')}</span>
                        {integration.lastSync && (
                          <span>Last sync: {integration.lastSync.toLocaleDateString()}</span>
                        )}
                      </div>

                      {integration.errorMessage && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{integration.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {integration.status === 'connected' && (
                      <button
                        onClick={() => syncIntegration(integration.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Sync now"
                      >
                        <Refresh className="w-4 h-4" />
                      </button>
                    )}
                    
                    {integration.status === 'error' && (
                      <button
                        onClick={() => testConnection(integration.id)}
                        disabled={testingConnection === integration.id}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      >
                        {testingConnection === integration.id ? 'Testing...' : 'Retry'}
                      </button>
                    )}

                    {!integration.isBuiltIn && (
                      <>
                        <button
                          onClick={() => {
                            const template = INTEGRATION_TEMPLATES.find(t => t.name === integration.name);
                            if (template) openConfigModal(template, integration);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit settings"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove integration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Integration</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTEGRATION_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openConfigModal(template)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        {getIntegrationIcon(template.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                          {template.type.replace('_', ' ')}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getIntegrationIcon(selectedTemplate.icon)}
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingIntegration ? 'Edit' : 'Configure'} {selectedTemplate.name}
                </h2>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {selectedTemplate.configSchema.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config[field.key] || false}
                          onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.checked }))}
                          className="w-4 h-4 text-[#A5F7AC] border-gray-300 rounded focus:ring-[#A5F7AC]"
                        />
                        <span className="ml-2 text-sm text-gray-600">{field.placeholder}</span>
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Privacy & Security</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your credentials are encrypted and stored securely. 
                      They are only used to connect to your chosen services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveIntegration}
                  className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
                >
                  {editingIntegration ? 'Update' : 'Connect'} Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integration;
