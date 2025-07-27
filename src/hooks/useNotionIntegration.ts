// src/hooks/useNotionIntegration.ts

import { useState, useCallback } from 'react';
import { NotionImportService, ImportedDatabase } from '../services/notion-import-service';
import { SupabaseImportService, ImportResult } from '../services/supabase-import-service';

export interface NotionIntegrationConfig {
  token: string;
  databaseUrls: string[];
  projectName: string;
}

export interface IntegrationState {
  isLoading: boolean;
  isImporting: boolean;
  previewData: ImportedDatabase[] | null;
  importResult: ImportResult | null;
  error: string | null;
}

export const useNotionIntegration = (userId: string) => {
  const [state, setState] = useState<IntegrationState>({
    isLoading: false,
    isImporting: false,
    previewData: null,
    importResult: null,
    error: null,
  });

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      isImporting: false,
      previewData: null,
      importResult: null,
      error: null,
    });
  }, []);

  const validateConfiguration = useCallback(async (config: NotionIntegrationConfig): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const notionService = new NotionImportService(config.token);
      
      // Validate token
      const isValidToken = await notionService.validateToken();
      if (!isValidToken) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid Notion integration token' 
        }));
        return false;
      }

      // Extract database IDs from URLs
      const databaseIds = config.databaseUrls
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => {
          try {
            return extractDatabaseIdFromUrl(url);
          } catch (error) {
            throw new Error(`Invalid database URL: ${url}`);
          }
        });

      if (databaseIds.length === 0) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Please provide at least one valid database URL' 
        }));
        return false;
      }

      // Validate database access
      const supabaseService = new SupabaseImportService();
      const validationErrors = await supabaseService.validateNotionDatabases(databaseIds, config.token);
      
      if (validationErrors.length > 0) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `Database access errors:\n${validationErrors.join('\n')}` 
        }));
        return false;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return true;

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Configuration validation failed' 
      }));
      return false;
    }
  }, []);

  const previewImport = useCallback(async (config: NotionIntegrationConfig): Promise<ImportedDatabase[] | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, previewData: null }));

    try {
      const notionService = new NotionImportService(config.token);
      
      // Extract database IDs from URLs
      const databaseUrls = config.databaseUrls
        .map(url => url.trim())
        .filter(url => url.length > 0);

      // Import preview data from all databases
      const databases = await notionService.importFromMultipleDatabases(databaseUrls);
      
      if (databases.length === 0) {
        throw new Error('No databases could be imported. Please check your URLs and permissions.');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        previewData: databases 
      }));

      return databases;

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to preview import' 
      }));
      return null;
    }
  }, []);

  const executeImport = useCallback(async (
    config: NotionIntegrationConfig,
    databases: ImportedDatabase[]
  ): Promise<ImportResult | null> => {
    setState(prev => ({ ...prev, isImporting: true, error: null, importResult: null }));

    try {
      // Check user permissions
      const supabaseService = new SupabaseImportService();
      const canImport = await supabaseService.canUserImport(userId);
      
      if (!canImport) {
        throw new Error('You need an active subscription or trial to import from Notion');
      }

      // Execute the import
      const result = await supabaseService.importFromNotion(
        databases,
        config.projectName,
        userId
      );

      // Also create imported_items for legacy compatibility
      const allRecords = databases.flatMap(db => db.records);
      if (result.projectId && allRecords.length > 0) {
        await supabaseService.createImportedItems(allRecords, result.projectId, userId);
      }

      setState(prev => ({ 
        ...prev, 
        isImporting: false, 
        importResult: result 
      }));

      return result;

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isImporting: false, 
        error: error.message || 'Import failed' 
      }));
      return null;
    }
  }, [userId]);

  const fullImportWorkflow = useCallback(async (config: NotionIntegrationConfig): Promise<ImportResult | null> => {
    // Step 1: Validate configuration
    const isValid = await validateConfiguration(config);
    if (!isValid) return null;

    // Step 2: Preview import
    const databases = await previewImport(config);
    if (!databases) return null;

    // Step 3: Execute import
    const result = await executeImport(config, databases);
    return result;
  }, [validateConfiguration, previewImport, executeImport]);

  return {
    ...state,
    validateConfiguration,
    previewImport,
    executeImport,
    fullImportWorkflow,
    resetState,
  };
};

// Helper function to extract database ID from various Notion URL formats
function extractDatabaseIdFromUrl(url: string): string {
  // Remove any query parameters and fragments
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Patterns to match different Notion URL formats
  const patterns = [
    /notion\.so\/([a-f0-9]{32})/, // Standard database URL
    /notion\.so\/.+\/([a-f0-9]{32})/, // Database URL with title
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/, // UUID format with hyphens
    /([a-f0-9]{32})/, // Plain 32-character hex string
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const id = match[1];
      // Remove hyphens from UUID format to get 32-character string
      return id.replace(/-/g, '');
    }
  }

  throw new Error(`Invalid Notion database URL format: ${url}`);
}

// Helper function to validate Notion database URL format
export function isValidNotionDatabaseUrl(url: string): boolean {
  try {
    extractDatabaseIdFromUrl(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function to format import summary
export function formatImportSummary(result: ImportResult): string {
  if (!result.success) {
    return `Import failed: ${result.errors.join(', ')}`;
  }

  const { imported } = result;
  const totalImported = imported.characters + imported.plots + imported.chapters + imported.locations;
  
  if (totalImported === 0) {
    return 'No records were imported';
  }

  const parts = [];
  if (imported.characters > 0) parts.push(`${imported.characters} characters`);
  if (imported.plots > 0) parts.push(`${imported.plots} plots`);
  if (imported.chapters > 0) parts.push(`${imported.chapters} chapters`);
  if (imported.locations > 0) parts.push(`${imported.locations} locations`);

  return `Successfully imported ${parts.join(', ')}`;
}

// Helper function to detect database content type from name
export function detectDatabaseTypeFromName(name: string): 'character' | 'plot' | 'chapter' | 'location' | 'unknown' {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('character')) return 'character';
  if (nameLower.includes('plot')) return 'plot';
  if (nameLower.includes('chapter')) return 'chapter';
  if (nameLower.includes('location') || nameLower.includes('world')) return 'location';
  
  return 'unknown';
}
