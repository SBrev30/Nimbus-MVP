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
  RefreshCw,
  BookOpen,
  Users,
  FileText,
  MapPin,
  Download,
  Upload
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'cloud_storage' | 'ai_service' | 'publishing' | 'backup' | 'analytics' | 'social' | 'notion_import';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  description: string;
  icon: string;
  config: Record<string, any>;
  lastSync?: Date;
  errorMessage?: string;
  isBuiltIn?: boolean;
}

interface NotionDatabase {
  id: string;
  name: string;
  type: 'characters' | 'plots' | 'chapters' | 'locations' | 'unknown';
  properties: Record<string, any>;
  records: any[];
}

interface NotionImportData {
  databases: NotionDatabase[];
  totalRecords: number;
  projectName: string;
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
    type: 'text' | 'password' | 'url' | 'select' | 'textarea';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    id: 'notion_novel_tracker',
    name: 'Notion Novel Tracker',
    type: 'notion_import',
    description: 'Import your characters, plots, and chapters from Notion\'s Writing Novel Tracker template',
    icon: 'notion',
    configSchema: [
      { 
        key: 'notionToken', 
        label: 'Notion Integration Token', 
        type: 'password', 
        required: true, 
        placeholder: 'secret_...' 
      },
      { 
        key: 'databaseUrls', 
        label: 'Database URLs (one per line)', 
        type: 'textarea', 
        required: true, 
        placeholder: 'https://notion.so/database-id-1\nhttps://notion.so/database-id-2' 
      },
      { 
        key: 'projectName', 
        label: 'Project Name', 
        type: 'text', 
        required: true, 
        placeholder: 'My Novel Project' 
      }
    ]
  },
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
  // ... other existing templates
];

interface IntegrationProps {
  onBack: () => void;
}

const Integration: React.FC<IntegrationProps> = ({ onBack }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [importData, setImportData] = useState<NotionImportData | null>(null);
  const [importing, setImporting] = useState(false);

  // Auto-save integrations to localStorage
  useEffect(() => {
    if (integrations.length > 0) {
      localStorage.setItem('integrations', JSON.stringify(integrations));
    }
  }, [integrations]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const stored = localStorage.getItem('integrations');
      const loadedIntegrations: Integration[] = stored ? JSON.parse(stored) : [];
      
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
        ...loadedIntegrations.filter(integration => !integration.isBuiltIn)
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
      case 'notion':
        return <BookOpen className="w-6 h-6" />;
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

  const detectNotionDatabaseType = (name: string, properties: Record<string, any>): NotionDatabase['type'] => {
    const nameL = name.toLowerCase();
    const propKeys = Object.keys(properties).map(k => k.toLowerCase());
    
    if (nameL.includes('character') || propKeys.some(k => k.includes('role') || k.includes('age') || k.includes('race'))) {
      return 'characters';
    }
    if (nameL.includes('plot') || propKeys.some(k => k.includes('storyline') || k.includes('outline'))) {
      return 'plots';
    }
    if (nameL.includes('chapter') || propKeys.some(k => k.includes('chapter') || k.includes('word count'))) {
      return 'chapters';
    }
    if (nameL.includes('location') || nameL.includes('world') || propKeys.some(k => k.includes('geography'))) {
      return 'locations';
    }
    return 'unknown';
  };

  const previewNotionImport = async () => {
    if (!selectedTemplate || selectedTemplate.id !== 'notion_novel_tracker') return;

    const token = config.notionToken;
    const databaseUrls = config.databaseUrls?.split('\n').filter(url => url.trim());
    
    if (!token || !databaseUrls?.length) {
      alert('Please provide Notion token and database URLs');
      return;
    }

    setTestingConnection(selectedTemplate.id);

    try {
      // Simulate fetching Notion data (replace with actual Notion API calls)
      const mockDatabases: NotionDatabase[] = [
        {
          id: 'characters-db',
          name: 'Characters',
          type: 'characters',
          properties: {
            Name: 'title',
            Role: 'select',
            Age: 'rich_text',
            Race: 'multi_select',
            Abilities: 'multi_select'
          },
          records: [
            {
              id: '1',
              Name: 'Aaron Walker',
              Role: 'Main Character',
              Age: '14 yo',
              Race: ['Dark Elf + Human'],
              content: 'Aaron Walker is impulsive with humor to hide sadness...'
            },
            {
              id: '2', 
              Name: 'Ethan Walker',
              Role: 'Main Character',
              Age: '12 yo',
              Race: ['Dark Elf + Human'],
              content: 'Ethan Walker is Aaron\'s younger brother...'
            }
          ]
        },
        {
          id: 'plots-db',
          name: 'Plots',
          type: 'plots',
          properties: {
            Name: 'title',
            Progress: 'rich_text',
            Storyline: 'select',
            Stats: 'select'
          },
          records: [
            {
              id: '1',
              Name: 'Main Quest Arc',
              Progress: '50%',
              Storyline: 'Chronological',
              Stats: 'Main Plot'
            }
          ]
        },
        {
          id: 'chapters-db',
          name: 'Chapters',
          type: 'chapters',
          properties: {
            'Title Chapter': 'title',
            'Chapter': 'number',
            Status: 'select',
            'Word Count': 'number'
          },
          records: [
            {
              id: '1',
              'Title Chapter': 'Chapter 1 - The Beginning',
              'Chapter': 1,
              Status: 'Done',
              'Word Count': 2500
            }
          ]
        }
      ];

      const totalRecords = mockDatabases.reduce((sum, db) => sum + db.records.length, 0);

      setImportData({
        databases: mockDatabases,
        totalRecords,
        projectName: config.projectName || 'Imported Novel Project'
      });

      setShowImportPreview(true);
    } catch (error) {
      console.error('Failed to preview Notion import:', error);
      alert('Failed to connect to Notion. Please check your token and database URLs.');
    } finally {
      setTestingConnection(null);
    }
  };

  const executeNotionImport = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      // Here you would implement the actual import logic to your Supabase database
      // This is a simulation of the import process
      
      const projectId = Date.now().toString();
      
      // Create project
      const project = {
        id: projectId,
        name: importData.projectName,
        description: `Imported from Notion on ${new Date().toLocaleDateString()}`,
        created_at: new Date().toISOString()
      };

      // Import characters
      for (const db of importData.databases) {
        if (db.type === 'characters') {
          for (const record of db.records) {
            const character = {
              id: `${projectId}-char-${record.id}`,
              project_id: projectId,
              name: record.Name || record.name,
              role: mapNotionRoleToApp(record.Role || record.role),
              age: record.Age || record.age,
              race: Array.isArray(record.Race) ? record.Race[0] : record.Race,
              abilities: Array.isArray(record.Abilities) ? record.Abilities : [],
              description: record.content || '',
              imported_from: 'notion',
              imported_at: new Date().toISOString()
            };
            // Save character to your database
            console.log('Would save character:', character);
          }
        }
        
        if (db.type === 'plots') {
          for (const record of db.records) {
            const plot = {
              id: `${projectId}-plot-${record.id}`,
              project_id: projectId,
              name: record.Name || record.name,
              progress: record.Progress || record.progress,
              storyline: record.Storyline || record.storyline,
              type: record.Stats || record.stats,
              imported_from: 'notion',
              imported_at: new Date().toISOString()
            };
            // Save plot to your database
            console.log('Would save plot:', plot);
          }
        }

        if (db.type === 'chapters') {
          for (const record of db.records) {
            const chapter = {
              id: `${projectId}-chapter-${record.id}`,
              project_id: projectId,
              title: record['Title Chapter'] || record.title,
              chapter_number: record.Chapter || record.chapter,
              status: mapNotionStatusToApp(record.Status || record.status),
              word_count: record['Word Count'] || record.word_count,
              imported_from: 'notion',
              imported_at: new Date().toISOString()
            };
            // Save chapter to your database
            console.log('Would save chapter:', chapter);
          }
        }
      }

      // Create the integration record
      const integrationData: Integration = {
        id: Date.now().toString(),
        name: selectedTemplate!.name,
        type: 'notion_import',
        status: 'connected',
        description: `Imported ${importData.totalRecords} records from Notion`,
        icon: 'notion',
        config: { ...config },
        lastSync: new Date()
      };

      setIntegrations(prev => [...prev, integrationData]);
      
      // Close modals
      setShowImportPreview(false);
      setShowConfigModal(false);
      setSelectedTemplate(null);
      setConfig({});
      setImportData(null);

      alert(`Successfully imported ${importData.totalRecords} records from Notion!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const mapNotionRoleToApp = (notionRole: string): string => {
    const roleMap: Record<string, string> = {
      'Main Character': 'protagonist',
      'Secondary Character': 'secondary',
      'Minor Character': 'minor',
      'Protagonist': 'protagonist',
      'Antagonist': 'antagonist',
      'Deuteragonist': 'secondary',
      'Tertagonists': 'secondary'
    };
    return roleMap[notionRole] || 'other';
  };

  const mapNotionStatusToApp = (notionStatus: string): string => {
    const statusMap: Record<string, string> = {
      'Not started': 'not_started',
      'In progress': 'in_progress', 
      'Rough Editing': 'draft',
      'Final Editing': 'editing',
      'Done': 'completed'
    };
    return statusMap[notionStatus] || 'not_started';
  };

  const openAddModal = () => {
    setSelectedTemplate(null);
    setConfig({});
    setShowAddModal(true);
  };

  const openConfigModal = (template: IntegrationTemplate, existingIntegration?: Integration) => {
    setSelectedTemplate(template);
    setEditingIntegration(existingIntegration || null);
    
    if (existingIntegration) {
      setConfig(existingIntegration.config);
    } else {
      setConfig({});
    }
    
    setShowAddModal(false);
    setShowConfigModal(true);
  };

  const saveIntegration = async () => {
    if (!selectedTemplate) return;

    // For Notion import, show preview instead of saving directly
    if (selectedTemplate.id === 'notion_novel_tracker') {
      await previewNotionImport();
      return;
    }

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
      setIntegrations(prev => prev.map(integration =>
        integration.id === editingIntegration.id ? integrationData : integration
      ));
    } else {
      setIntegrations(prev => [...prev, integrationData]);
    }

    setShowConfigModal(false);
    setSelectedTemplate(null);
    setEditingIntegration(null);
    setConfig({});
  };

  // Rest of your existing methods...
  const testConnection = async (integrationId: string) => {
    setTestingConnection(integrationId);
    
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'connected' as const, lastSync: new Date(), errorMessage: undefined }
          : integration
      ));
      setTestingConnection(null);
    }, 2000);
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

    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === id
          ? { ...integration, status: 'connected' as const, lastSync: new Date() }
          : integration
      ));
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#889096]">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-t-[17px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect external services to enhance your writing workflow</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {integrations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations configured</h3>
              <p className="text-gray-600 mb-6">Connect services to backup your work, enhance your writing, and streamline your workflow</p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00] text-white rounded-lg transition-colors"
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
                    <div className="flex-shrink-0 p-3 bg-[#e8ddc1] rounded-lg">
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
                        <RefreshCw className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Add Integration</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INTEGRATION_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#ff4e00] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => openConfigModal(template)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        {getIntegrationIcon(template.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <span className="text-xs text-gray-500 capitalize">
                          {template.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure Integration Modal */}
      {showConfigModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                    {getIntegrationIcon(selectedTemplate.icon)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {editingIntegration ? 'Edit' : 'Configure'} {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      />
                    ) : (
                      <input
                        type={field.type === 'password' ? 'password' : 'text'}
                        value={config[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4e00] focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>

              {selectedTemplate.id === 'notion_novel_tracker' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Notion Setup Instructions</h4>
                      <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                        <li>Create a Notion integration at <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="underline">notion.so/my-integrations</a></li>
                        <li>Copy the "Internal Integration Token"</li>
                        <li>Share your Writing Novel Tracker databases with the integration</li>
                        <li>Copy the database URLs from your browser address bar</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Security Notice</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your credentials are stored locally in your browser and are never sent to our servers. 
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
                  disabled={testingConnection === selectedTemplate.id}
                  className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {testingConnection === selectedTemplate.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing Connection...</span>
                    </div>
                  ) : selectedTemplate.id === 'notion_novel_tracker' ? 'Preview Import' : editingIntegration ? 'Update Integration' : 'Connect Integration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notion Import Preview Modal */}
      {showImportPreview && importData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Preview Notion Import</h2>
                  <p className="text-gray-600">Review the data that will be imported from your Notion workspace</p>
                </div>
                <button
                  onClick={() => setShowImportPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Import Summary */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Connection Successful</h3>
                </div>
                <p className="text-green-700">
                  Found <strong>{importData.totalRecords} records</strong> across <strong>{importData.databases.length} databases</strong> 
                  for project "<strong>{importData.projectName}</strong>"
                </p>
              </div>

              {/* Database Preview */}
              <div className="space-y-6">
                {importData.databases.map((db) => (
                  <div key={db.id} className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          {db.type === 'characters' && <Users className="w-5 h-5 text-blue-600" />}
                          {db.type === 'plots' && <FileText className="w-5 h-5 text-purple-600" />}
                          {db.type === 'chapters' && <BookOpen className="w-5 h-5 text-green-600" />}
                          {db.type === 'locations' && <MapPin className="w-5 h-5 text-red-600" />}
                          {db.type === 'unknown' && <Database className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{db.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {db.type.replace('_', ' ')} • {db.records.length} records
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-3">
                        {db.records.slice(0, 3).map((record, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900 mb-1">
                              {record.Name || record.name || record['Title Chapter'] || `Record ${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-600 space-x-4">
                              {db.type === 'characters' && (
                                <>
                                  <span>Role: {record.Role || 'Unknown'}</span>
                                  <span>Age: {record.Age || 'Unknown'}</span>
                                </>
                              )}
                              {db.type === 'plots' && (
                                <>
                                  <span>Progress: {record.Progress || 'Unknown'}</span>
                                  <span>Type: {record.Stats || 'Unknown'}</span>
                                </>
                              )}
                              {db.type === 'chapters' && (
                                <>
                                  <span>Chapter: {record.Chapter || 'Unknown'}</span>
                                  <span>Status: {record.Status || 'Unknown'}</span>
                                  <span>Words: {record['Word Count'] || 0}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {db.records.length > 3 && (
                          <div className="text-sm text-gray-500 text-center">
                            ... and {db.records.length - 3} more records
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeNotionImport}
                  disabled={importing}
                  className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {importing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Import {importData.totalRecords} Records</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Support both named and default export for compatibility
export { Integration };
export default Integration;
