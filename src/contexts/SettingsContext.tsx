import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';

// Types for History data
interface HistoryEntry {
  id: string;
  type: 'create' | 'edit' | 'delete';
  target: 'chapter' | 'character' | 'note' | 'project';
  title: string;
  description: string;
  timestamp: Date;
  details?: string;
  wordCountChange?: number;
}

// Types for Integration data
interface NotionConnection {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: Date;
  databases: NotionDatabase[];
}

interface NotionDatabase {
  id: string;
  name: string;
  type: 'characters' | 'locations' | 'general';
  recordCount: number;
  tags: string[];
}

interface GoogleDocsConnection {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: Date;
  documents: GoogleDoc[];
}

interface GoogleDoc {
  id: string;
  name: string;
  lastModified: Date;
  characterTags: string[];
  locationTags: string[];
}

interface SettingsContextType {
  // Settings navigation state
  activeSettingsTab: 'general' | 'history' | 'integrations';
  setActiveSettingsTab: (tab: 'general' | 'history' | 'integrations') => void;
  
  // History data (lazy loaded)
  historyData: HistoryEntry[] | null;
  loadHistoryData: () => Promise<void>;
  filterHistoryData: (timeFilter: 'day' | 'week' | 'month', typeFilter: 'all' | 'edit' | 'create' | 'delete') => HistoryEntry[];
  
  // Integration data (lazy loaded)
  notionConnections: NotionConnection[] | null;
  googleDocsConnections: GoogleDocsConnection[] | null;
  loadIntegrationData: () => Promise<void>;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Integration actions
  connectNotion: (workspaceName: string) => Promise<void>;
  syncNotion: (connectionId: string) => Promise<void>;
  connectGoogleDocs: () => Promise<void>;
  syncGoogleDocs: (connectionId: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'history' | 'integrations'>('general');
  const [historyData, setHistoryData] = useState<HistoryEntry[] | null>(null);
  const [notionConnections, setNotionConnections] = useState<NotionConnection[] | null>(null);
  const [googleDocsConnections, setGoogleDocsConnections] = useState<GoogleDocsConnection[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock history data (in real app, this would come from backend)
  const generateMockHistoryData = useCallback((): HistoryEntry[] => {
    const now = new Date();
    const mockData: HistoryEntry[] = [];
    
    // Generate recent activity
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const types: HistoryEntry['type'][] = ['create', 'edit', 'delete'];
      const targets: HistoryEntry['target'][] = ['chapter', 'character', 'note', 'project'];
      
      const type = types[Math.floor(Math.random() * types.length)];
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      mockData.push({
        id: `history-${i}`,
        type,
        target,
        title: `${target.charAt(0).toUpperCase() + target.slice(1)} ${type}d`,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)}d ${target}: Example content`,
        timestamp,
        details: type === 'edit' ? 'Updated content and structure' : undefined,
        wordCountChange: type === 'edit' && target === 'chapter' ? Math.floor(Math.random() * 200) - 100 : undefined
      });
    }
    
    return mockData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  // Generate mock integration data
  const generateMockIntegrationData = useCallback(() => {
    const mockNotion: NotionConnection[] = [
      {
        id: 'notion-1',
        name: 'My Writing Workspace',
        connected: true,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        databases: [
          {
            id: 'db1',
            name: 'Character Profiles',
            type: 'characters',
            recordCount: 12,
            tags: ['@character', '#protagonist', '#antagonist']
          },
          {
            id: 'db2',
            name: 'World Locations',
            type: 'locations',
            recordCount: 8,
            tags: ['@location', '#city', '#landmark']
          }
        ]
      }
    ];

    const mockGoogleDocs: GoogleDocsConnection[] = [
      {
        id: 'gdocs-1',
        name: 'Google Drive',
        connected: false,
        documents: []
      }
    ];

    return { mockNotion, mockGoogleDocs };
  }, []);

  // Lazy load history data
  const loadHistoryData = useCallback(async () => {
    if (historyData) return; // Already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try to load from localStorage first
      const stored = localStorage.getItem('writersblock-history-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const processedData = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setHistoryData(processedData);
      } else {
        // Generate and store mock data
        const mockData = generateMockHistoryData();
        setHistoryData(mockData);
        localStorage.setItem('writersblock-history-data', JSON.stringify(mockData));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history data';
      console.error('Failed to load history data:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [historyData, generateMockHistoryData]);

  // Lazy load integration data
  const loadIntegrationData = useCallback(async () => {
    if (notionConnections && googleDocsConnections) return; // Already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Try to load from localStorage first
      const storedNotion = localStorage.getItem('writersblock-notion-connections');
      const storedGoogleDocs = localStorage.getItem('writersblock-googledocs-connections');
      
      if (storedNotion && storedGoogleDocs) {
        const notionData = JSON.parse(storedNotion).map((conn: any) => ({
          ...conn,
          lastSync: conn.lastSync ? new Date(conn.lastSync) : undefined
        }));
        const googleDocsData = JSON.parse(storedGoogleDocs).map((conn: any) => ({
          ...conn,
          lastSync: conn.lastSync ? new Date(conn.lastSync) : undefined,
          documents: conn.documents.map((doc: any) => ({
            ...doc,
            lastModified: new Date(doc.lastModified)
          }))
        }));
        
        setNotionConnections(notionData);
        setGoogleDocsConnections(googleDocsData);
      } else {
        // Generate and store mock data
        const { mockNotion, mockGoogleDocs } = generateMockIntegrationData();
        setNotionConnections(mockNotion);
        setGoogleDocsConnections(mockGoogleDocs);
        localStorage.setItem('writersblock-notion-connections', JSON.stringify(mockNotion));
        localStorage.setItem('writersblock-googledocs-connections', JSON.stringify(mockGoogleDocs));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load integration data';
      console.error('Failed to load integration data:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [notionConnections, googleDocsConnections, generateMockIntegrationData]);

  // Filter history data
  const filterHistoryData = useCallback((
    timeFilter: 'day' | 'week' | 'month',
    typeFilter: 'all' | 'edit' | 'create' | 'delete'
  ): HistoryEntry[] => {
    if (!historyData) return [];

    const now = new Date();
    let timeFilterMs: number;
    
    switch (timeFilter) {
      case 'day':
        timeFilterMs = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        timeFilterMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        timeFilterMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeFilterMs = 30 * 24 * 60 * 60 * 1000;
    }

    return historyData.filter(entry => {
      const timeMatch = now.getTime() - entry.timestamp.getTime() <= timeFilterMs;
      const typeMatch = typeFilter === 'all' || entry.type === typeFilter;
      return timeMatch && typeMatch;
    });
  }, [historyData]);

  // Integration actions
  const connectNotion = useCallback(async (workspaceName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newConnection: NotionConnection = {
        id: `notion-${Date.now()}`,
        name: workspaceName,
        connected: true,
        lastSync: new Date(),
        databases: []
      };
      
      setNotionConnections(prev => prev ? [...prev, newConnection] : [newConnection]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Notion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncNotion = useCallback(async (connectionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setNotionConnections(prev => 
        prev ? prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, lastSync: new Date() }
            : conn
        ) : null
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync Notion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectGoogleDocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const primaryConnection = googleDocsConnections?.find(conn => conn.name === 'Google Drive');
      if (!primaryConnection) {
        throw new Error('Primary Google Docs connection not found');
      }
      
      setGoogleDocsConnections(prev => 
        prev ? prev.map(conn => 
          conn.id === primaryConnection.id 
            ? { ...conn, connected: true, lastSync: new Date() }
            : conn
        ) : null
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Google Docs';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncGoogleDocs = useCallback(async (connectionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setGoogleDocsConnections(prev => 
        prev ? prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, lastSync: new Date() }
            : conn
        ) : null
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync Google Docs';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    activeSettingsTab,
    setActiveSettingsTab,
    historyData,
    loadHistoryData,
    filterHistoryData,
    notionConnections,
    googleDocsConnections,
    loadIntegrationData,
    isLoading,
    error,
    connectNotion,
    syncNotion,
    connectGoogleDocs,
    syncGoogleDocs,
  }), [
    activeSettingsTab,
    setActiveSettingsTab,
    historyData,
    loadHistoryData,
    filterHistoryData,
    notionConnections,
    googleDocsConnections,
    loadIntegrationData,
    isLoading,
    error,
    connectNotion,
    syncNotion,
    connectGoogleDocs,
    syncGoogleDocs,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
