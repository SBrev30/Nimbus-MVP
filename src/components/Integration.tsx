import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Database, 
  Cloud, 
  Zap,
  Key,
  Shield,
  ExternalLink,
  RotateCcw // Changed from Refresh to RotateCcw
} from 'lucide-react';
import { useUnifiedAutoSave } from '../hooks/useUnifiedAutoSave';

interface Integration {
  id: string;
  name: string;
  type: 'cloud_storage' | 'ai_service' | 'publishing' | 'backup' | 'analytics' | 'social';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  description: string;
  icon: string;
  config: Record<string, any>;
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
    type: 'text' | 'password' | 'url' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    type: 'cloud_storage',
    description: 'Automatically backup and sync your work to Google Drive',
    icon: 'drive',
    configSchema: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Enter your Google Drive API key' },
      { key: 'folderId', label: 'Folder ID', type: 'text', required: false, placeholder: 'Optional: Specific folder ID' }
    ]
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    type: 'cloud_storage',
    description: 'Sync your writing projects with Dropbox',
    icon: 'cloud',
    configSchema: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'Enter your Dropbox access token' }
    ]
  },
  {
    id: 'openai_gpt',
    name: 'OpenAI GPT',
    type: 'ai_service',
    description: 'Enhance your writing with AI-powered suggestions and analysis',
    icon: 'zap',
    configSchema: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'model', label: 'Model', type: 'select', required: true, options: ['gpt-4', 'gpt-3.5-turbo'], placeholder: 'Choose model' }
    ]
  },
  {
    id: 'claude_ai',
    name: 'Claude AI',
    type: 'ai_service',
    description: 'Advanced AI writing assistance and analysis',
    icon: 'zap',
    configSchema: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Enter your Claude API key' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'backup',
    description: 'Version control and backup your writing projects',
    icon: 'cloud',
    configSchema: [
      { key: 'token', label: 'Personal Access Token', type: 'password', required: true, placeholder: 'ghp_...' },
      { key: 'repository', label: 'Repository', type: 'text', required: true, placeholder: 'username/repository-name' }
    ]
  }
];

export default function Integration({ onBack }: { onBack: () => void }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { saveData } = useUnifiedAutoSave();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
 const loadIntegrations = async () => {
   try {
     let stored = localStorage.getItem('writer-integrations');
     
     // Migration logic for existing data
     if (!stored) {
       const oldData = localStorage.getItem('app-integrations');
       if (oldData) {
         localStorage.setItem('writer-integrations', oldData);
         localStorage.removeItem('app-integrations');
         stored = oldData;
       }
     }
     
     const loadedIntegrations = stored ? JSON.parse(stored) : [];
      
      // Add built-in integrations if they don't exist
      const builtInIntegrations: Integration[] = [
        {
          id: 'local_storage',
          name: 'Local Storage',
          type: 'backup',
          status: 'connected',
          description: 'Automatic local backup of your work',
          icon: 'database',
          config: {},
          isBuiltIn: true,
          lastSync: new Date()
        }
      ];

      const mergedIntegrations = [
        ...builtInIntegrations,
        ...loadedIntegrations.filter((integration: Integration) => !integration.isBuiltIn)
      ];

      setIntegrations(mergedIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIntegrationIcon = (iconType: string) => {
    switch (iconType) {
      case 'drive':
      case 'cloud':
        return <Cloud className="w-6 h-6" />;
      case 'zap':
        return <Zap className="w-6 h-6" />;
      case 'globe':
        return <Globe className="w-6 h-6" />;
      case 'database':
        return <Database className="w-6 h-6" />;
      default:
        return <Settings className="w-6 h-6" />;
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const openAddModal = () => {
    setSelectedTemplate(null);
    setConfig({});
    setShowAddModal(true);
  };

  const openConfigModal = (template: IntegrationTemplate, existingIntegration?: Integration) => {
    setSelectedTemplate(template);
    setEditingIntegration(existingIntegration || null);
    
    // Pre-fill config if editing
    if (existingIntegration) {
      setConfig(existingIntegration.config);
    } else {
      setConfig({});
    }
    
    setShowAddModal(false);
    setShowConfigModal(true);
  };

  const testConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    
    // Simulate connection test
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected' as const, lastSync: new Date() }
          : integration
      ));
      setTestingConnection(null);
      saveIntegrations();
    }, 2000);
  };

  const refreshIntegration = async (integrationId: string) => {
    setTestingConnection(integrationId);
    
    // Simulate refresh
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, lastSync: new Date() }
          : integration
      ));
      setTestingConnection(null);
      saveIntegrations();
    }, 1000);
  };

  const saveIntegrations = () => {
    const integrationsToSave = integrations.filter(integration => !integration.isBuiltIn);
    localStorage.setItem('writer-integrations', JSON.stringify(integrationsToSave));
    saveData('integrations', integrationsToSave);
  };

  const handleSaveIntegration = () => {
    if (!selectedTemplate) return;

// Validate required fields
for (const field of selectedTemplate.configSchema) {
if (field.required && !config[field.key]) {
alert(`${field.label} is required`);
return;
}
}

    const newIntegration: Integration = {
      id: editingIntegration?.id || `${selectedTemplate.id}_${Date.now()}`,
      name: selectedTemplate.name,
      type: selectedTemplate.type,
      status: 'pending',
      description: selectedTemplate.description,
      icon: selectedTemplate.icon,
      config: config
    };

    if (editingIntegration) {
      setIntegrations(prev => prev.map(integration =>
        integration.id === editingIntegration.id ? newIntegration : integration
      ));
    } else {
      setIntegrations(prev => [...prev, newIntegration]);
    }

    setShowConfigModal(false);
    setSelectedTemplate(null);
    setEditingIntegration(null);
    setConfig({});
    saveIntegrations();
  };

  const deleteIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    setShowDeleteConfirm(null);
    saveIntegrations();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F9] rounded-t-[17px] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">Connect external services to enhance your writing workflow</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Integration</span>
          </button>
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
                          <p className="text-sm text-red-700">{integration.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!integration.isBuiltIn && (
                      <>
                        <button
                          onClick={() => refreshIntegration(integration.id)}
                          disabled={testingConnection === integration.id}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Refresh connection"
                        >
                          <RotateCcw className={`w-4 h-4 ${testingConnection === integration.id ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => {
                            // Store template ID separately or use a more robust lookup
                            const templateId = integration.id.includes('_') ? integration.id.split('_')[0] : integration.id;
                            const template = INTEGRATION_TEMPLATES.find(t => t.id === templateId);
                            if (template) openConfigModal(template, integration);
                          }}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit configuration"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {integration.status === 'pending' && (
                          <button
                            onClick={() => testConnection(integration.id)}
                            disabled={testingConnection === integration.id}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                          >
                            {testingConnection === integration.id ? 'Testing...' : 'Test'}
                          </button>
                        )}

                        <button
                          onClick={() => setShowDeleteConfirm(integration.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete integration"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Integration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INTEGRATION_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => openConfigModal(template)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-[#A5F7AC] hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getIntegrationIcon(template.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {template.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingIntegration ? 'Edit' : 'Configure'} {selectedTemplate.name}
            </h2>
            
            <div className="space-y-4">
              {selectedTemplate.configSchema.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={config[field.key] || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                      required={field.required}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={config[field.key] || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A5F7AC] focus:border-transparent"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIntegration}
                className="px-4 py-2 bg-[#A5F7AC] hover:bg-[#A5F7AC]/80 text-white rounded-lg transition-colors"
              >
                {editingIntegration ? 'Update' : 'Add'} Integration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Integration</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this integration? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteIntegration(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
