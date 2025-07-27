// src/services/supabase-import-service.ts

import { supabase } from '../lib/supabase';
import { DatabaseMapper, ImportedDatabase, ImportedRecord } from './notion-import-service';

export interface ImportResult {
  success: boolean;
  projectId?: string;
  imported: {
    characters: number;
    plots: number;
    chapters: number;
    locations: number;
  };
  errors: string[];
}

export class SupabaseImportService {
  
  async importFromNotion(
    databases: ImportedDatabase[], 
    projectName: string,
    userId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: {
        characters: 0,
        plots: 0,
        chapters: 0,
        locations: 0,
      },
      errors: [],
    };

    try {
      // Create project first
      const project = await this.createProject(projectName, userId);
      result.projectId = project.id;

      // Import each database type
      for (const database of databases) {
        try {
          await this.importChapters(database.records, projectId, result);
        break;
      case 'location':
        await this.importLocations(database.records, projectId, result);
        break;
      default:
        console.log(`Skipping unknown database type: ${database.type}`);
    }
  }

  private async importCharacters(records: ImportedRecord[], projectId: string, result: ImportResult) {
    const charactersToInsert = records.map(record => 
      DatabaseMapper.mapCharacterToApp(record, projectId)
    );

    if (charactersToInsert.length === 0) return;

    const { data, error } = await supabase
      .from('characters')
      .insert(charactersToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to import characters: ${error.message}`);
    }

    result.imported.characters = data?.length || 0;
  }

  private async importPlots(records: ImportedRecord[], projectId: string, result: ImportResult) {
    const plotsToInsert = records.map(record => 
      DatabaseMapper.mapPlotToApp(record, projectId)
    );

    if (plotsToInsert.length === 0) return;

    // Import as plot_threads to match your existing schema
    const { data, error } = await supabase
      .from('plot_threads')
      .insert(plotsToInsert.map(plot => ({
        id: plot.id,
        project_id: plot.project_id,
        name: plot.name,
        description: plot.description,
        status: plot.status,
        color: '#3B82F6', // Default blue color
        tension_start: 1,
        tension_end: 5,
        completion_percentage: plot.progress ? this.parseProgress(plot.progress) : 0,
        imported_from: plot.imported_from,
        imported_at: plot.imported_at,
      })))
      .select();

    if (error) {
      throw new Error(`Failed to import plots: ${error.message}`);
    }

    result.imported.plots = data?.length || 0;
  }

  private async importChapters(records: ImportedRecord[], projectId: string, result: ImportResult) {
    const chaptersToInsert = records.map(record => 
      DatabaseMapper.mapChapterToApp(record, projectId)
    );

    if (chaptersToInsert.length === 0) return;

    const { data, error } = await supabase
      .from('chapters')
      .insert(chaptersToInsert.map(chapter => ({
        id: chapter.id,
        project_id: chapter.project_id,
        title: chapter.title,
        chapter_number: chapter.chapter_number,
        description: chapter.description,
        status: chapter.status,
        word_count: chapter.word_count,
        type: 'chapter', // Default type
        significance: 'medium', // Default significance
        order: chapter.chapter_number,
        imported_from: chapter.imported_from,
        imported_at: chapter.imported_at,
      })))
      .select();

    if (error) {
      throw new Error(`Failed to import chapters: ${error.message}`);
    }

    result.imported.chapters = data?.length || 0;
  }

  private async importLocations(records: ImportedRecord[], projectId: string, result: ImportResult) {
    const locationsToInsert = records.map(record => ({
      id: `${projectId}-loc-${record.id}`,
      project_id: projectId,
      name: record.name,
      description: record.properties.content || '',
      geography: record.properties.Geography || '',
      culture: record.properties.Culture || '',
      climate: record.properties.Climate || '',
      population: record.properties.Population || '',
      government: record.properties.Government || '',
      economy: record.properties.Economy || '',
      notable_features: record.properties['Notable Features'] || '',
      connected_characters: [], // Will be populated later if relationships exist
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    if (locationsToInsert.length === 0) return;

    const { data, error } = await supabase
      .from('locations')
      .insert(locationsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to import locations: ${error.message}`);
    }

    result.imported.locations = data?.length || 0;
  }

  private parseProgress(progressStr: string): number {
    if (!progressStr) return 0;
    
    // Extract percentage from strings like "50%", "75 percent", etc.
    const match = progressStr.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, num));
    }
    
    return 0;
  }

  // Helper method to check if user has permission to create projects
  async canUserImport(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_status, trial_expires_at')
        .eq('id', userId)
        .single();

      if (!profile) return false;

      // Check if user has active subscription or trial
      if (profile.subscription_status === 'active') return true;
      
      if (profile.trial_expires_at) {
        const trialExpires = new Date(profile.trial_expires_at);
        return trialExpires > new Date();
      }

      return false;
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }

  // Method to create imported_items entries for legacy compatibility
  async createImportedItems(
    records: ImportedRecord[], 
    projectId: string, 
    userId: string
  ): Promise<void> {
    const itemsToInsert = records.map(record => ({
      id: `notion-${record.id}`,
      user_id: userId,
      project_id: projectId,
      type: this.mapRecordTypeToItemType(record.type),
      title: record.name,
      content: JSON.stringify(record.properties),
      tags: this.extractTagsFromRecord(record),
      word_count: this.estimateWordCount(record),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('imported_items')
      .insert(itemsToInsert);

    if (error) {
      console.error('Failed to create imported_items:', error);
      // Don't throw error as this is for legacy compatibility
    }
  }

  private mapRecordTypeToItemType(recordType: string): string {
    const typeMap: Record<string, string> = {
      'character': 'character',
      'plot': 'plot',
      'chapter': 'chapter',
      'location': 'research',
    };
    return typeMap[recordType] || 'research';
  }

  private extractTagsFromRecord(record: ImportedRecord): string[] {
    const tags: string[] = [];
    
    // Add type as tag
    tags.push(record.type);
    
    // Extract tags from properties
    Object.entries(record.properties).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        tags.push(...value.filter(v => typeof v === 'string'));
      } else if (typeof value === 'string' && value.length > 0 && value.length < 50) {
        // Add short string values as potential tags
        if (key.toLowerCase().includes('role') || 
            key.toLowerCase().includes('type') || 
            key.toLowerCase().includes('status')) {
          tags.push(value);
        }
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  private estimateWordCount(record: ImportedRecord): number {
    const content = record.properties.content || '';
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Method to validate database permissions before import
  async validateNotionDatabases(databaseIds: string[], token: string): Promise<string[]> {
    const errors: string[] = [];
    
    for (const dbId of databaseIds) {
      try {
        const response = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            errors.push(`Database ${dbId} not found or not shared with integration`);
          } else if (response.status === 403) {
            errors.push(`No permission to access database ${dbId}`);
          } else {
            errors.push(`Failed to access database ${dbId}: ${response.statusText}`);
          }
        }
      } catch (error) {
        errors.push(`Network error accessing database ${dbId}: ${error.message}`);
      }
    }

    return errors;
  }
}.importDatabase(database, project.id, result);
        } catch (error) {
          console.error(`Failed to import database ${database.name}:`, error);
          result.errors.push(`Failed to import ${database.name}: ${error.message}`);
        }
      }

      result.success = result.errors.length === 0 || 
        (result.imported.characters + result.imported.plots + result.imported.chapters + result.imported.locations) > 0;

    } catch (error) {
      console.error('Import failed:', error);
      result.errors.push(`Import failed: ${error.message}`);
    }

    return result;
  }

  private async createProject(name: string, userId: string) {
    const projectData = {
      name,
      description: `Imported from Notion on ${new Date().toLocaleDateString()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  private async importDatabase(database: ImportedDatabase, projectId: string, result: ImportResult) {
    switch (database.type) {
      case 'character':
        await this.importCharacters(database.records, projectId, result);
        break;
      case 'plot':
        await this.importPlots(database.records, projectId, result);
        break;
      case 'chapter':
        await this
