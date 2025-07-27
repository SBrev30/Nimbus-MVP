// src/services/enhanced-supabase-import-service.ts - OPTIMIZED VERSION

import { supabase } from '../lib/supabase';
import { ImportedDatabase, ImportedRecord } from './notion-import-service';

export interface ImportResult {
  success: boolean;
  projectId?: string;
  imported: {
    characters: number;
    plotThreads: number;
    chapters: number;
    locations: number;
    worldElements: number;
    outlineNodes: number;
  };
  errors: string[];
  planningPageDistribution: {
    charactersPage: string[];
    plotPage: string[];
    worldBuildingPage: string[];
    outlinePage: string[];
  };
}

export class EnhancedSupabaseImportService {
  
  async importFromNotion(
    databases: ImportedDatabase[], 
    projectName: string,
    userId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: { characters: 0, plotThreads: 0, chapters: 0, locations: 0, worldElements: 0, outlineNodes: 0 },
      errors: [],
      planningPageDistribution: { charactersPage: [], plotPage: [], worldBuildingPage: [], outlinePage: [] },
    };

    try {
      // Create project first
      const project = await this.createProject(projectName, userId);
      result.projectId = project.id;

      // Process each database type
      for (const database of databases) {
        try {
          await this.importDatabaseWithDistribution(database, project.id, result);
        } catch (error) {
          console.error(`Failed to import database ${database.name}:`, error);
          result.errors.push(`Failed to import ${database.name}: ${error.message}`);
        }
      }

      // 🔥 CREATE IMPORTED_ITEMS FOR LIBRARY COMPATIBILITY
      try {
        await this.createImportedItemsForLibrary(databases, project.id, userId);
      } catch (error) {
        console.warn('Failed to create imported_items for Library:', error);
      }

      result.success = result.errors.length === 0 || this.getTotalImported(result.imported) > 0;

    } catch (error) {
      console.error('Import failed:', error);
      result.errors.push(`Import failed: ${error.message}`);
    }

    return result;
  }

  private async createProject(name: string, userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        description: `Imported from Notion on ${new Date().toLocaleDateString()}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);
    return data;
  }

  private async importDatabaseWithDistribution(database: ImportedDatabase, projectId: string, result: ImportResult) {
    const importMap = {
      'character': () => this.importCharacters(database.records, projectId, result),
      'plot': () => this.importPlots(database.records, projectId, result),
      'chapter': () => this.importChaptersWithDistribution(database.records, projectId, result),
      'location': () => this.importLocationsWithDistribution(database.records, projectId, result),
    };

    const importFn = importMap[database.type] || (() => this.importAsWorldElements(database.records, projectId, result));
    await importFn();
  }

  // ===== CHARACTER IMPORT =====
  private async importCharacters(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const charactersToInsert = records.map(record => ({
      id: `${projectId}-char-${record.id}`,
      project_id: projectId,
      name: record.name,
      role: this.mapNotionRoleToApp(record.properties.Role || record.properties.Type || ''),
      age: this.extractAge(record.properties.Age || record.properties['Age '] || ''),
      description: this.buildDescription(record),
      background: record.properties.Background || record.properties.Backstory || '',
      physical_description: record.properties['Face Claim'] || record.properties.Appearance || '',
      traits: this.extractTraits(record.properties),
      tags: this.extractTags(record.properties),
      fantasy_class: this.extractFantasyClass(record.properties),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('characters').insert(charactersToInsert).select();
    if (error) throw new Error(`Failed to import characters: ${error.message}`);

    result.imported.characters = data?.length || 0;
    result.planningPageDistribution.charactersPage.push(
      `${result.imported.characters} characters imported with roles, abilities, and detailed descriptions`
    );
  }

  // ===== PLOT IMPORT =====
  private async importPlots(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const plotThreadsToInsert = records.map(record => ({
      id: `${projectId}-plot-${record.id}`,
      project_id: projectId,
      title: record.name,
      description: record.properties.content || record.properties.Description || '',
      type: this.mapPlotType(record.properties.Stats || record.properties.Type || 'subplot'),
      status: this.mapStatus(record.properties.Finished || record.properties.Status || 'in_progress'),
      color: this.getPlotColor(record.properties.Stats || record.properties.Type),
      completion_percentage: this.parseProgress(record.properties.Progress || '0%'),
      tags: this.extractTags(record.properties),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('plot_threads').insert(plotThreadsToInsert).select();
    if (error) throw new Error(`Failed to import plot threads: ${error.message}`);

    result.imported.plotThreads = data?.length || 0;
    result.planningPageDistribution.plotPage.push(
      `${result.imported.plotThreads} plot threads imported with progress tracking`
    );
  }

  // ===== CHAPTER IMPORT =====
  private async importChaptersWithDistribution(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const chaptersToInsert = records.map(record => ({
      id: `${projectId}-chapter-${record.id}`,
      project_id: projectId,
      title: record.name,
      chapter_number: record.properties.Chapter || record.properties['Chapter '] || 0,
      description: record.properties.Notes || record.properties['Notes '] || record.properties.Description || '',
      status: this.mapChapterStatus(record.properties.Status || 'not_started'),
      word_count: record.properties['Word Count'] || 0,
      order: record.properties.Chapter || record.properties['Chapter '] || 0,
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data: chaptersData, error } = await supabase.from('chapters').insert(chaptersToInsert).select();
    if (error) throw new Error(`Failed to import chapters: ${error.message}`);

    result.imported.chapters = chaptersData?.length || 0;

    // Create outline structure
    const outlineNodes = await this.createOutlineFromChapters(records, projectId);
    result.imported.outlineNodes = outlineNodes;

    result.planningPageDistribution.outlinePage.push(
      `${result.imported.chapters} chapters organized into ${outlineNodes} outline nodes`
    );
  }

  // ===== LOCATION IMPORT =====
  private async importLocationsWithDistribution(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    // Import to locations table
    const locationsToInsert = records.map(record => ({
      id: `${projectId}-loc-${record.id}`,
      project_id: projectId,
      name: record.name,
      description: record.properties.content || record.properties.Description || '',
      geography: record.properties.Geography || '',
      culture: record.properties.Culture || '',
      climate: record.properties.Climate || '',
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data: locationsData, error } = await supabase.from('locations').insert(locationsToInsert).select();
    if (error) throw new Error(`Failed to import locations: ${error.message}`);

    result.imported.locations = locationsData?.length || 0;

    // Also import as world elements
    const worldElementsToInsert = records.map(record => ({
      id: `${projectId}-world-${record.id}`,
      project_id: projectId,
      title: record.name,
      category: 'location',
      description: record.properties.content || record.properties.Description || '',
      tags: this.extractTags(record.properties),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data: worldElementsData } = await supabase.from('world_elements').insert(worldElementsToInsert).select();
    result.imported.worldElements = worldElementsData?.length || 0;

    result.planningPageDistribution.worldBuildingPage.push(
      `${result.imported.locations} locations imported with geography and culture details`
    );
  }

  // ===== WORLD ELEMENTS IMPORT =====
  private async importAsWorldElements(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const worldElementsToInsert = records.map(record => ({
      id: `${projectId}-world-${record.id}`,
      project_id: projectId,
      title: record.name,
      category: this.detectWorldElementCategory(record),
      description: record.properties.content || record.properties.Description || '',
      tags: this.extractTags(record.properties),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('world_elements').insert(worldElementsToInsert).select();
    if (error) throw new Error(`Failed to import world elements: ${error.message}`);

    result.imported.worldElements += data?.length || 0;
    result.planningPageDistribution.worldBuildingPage.push(
      `${data?.length} miscellaneous elements imported as world-building content`
    );
  }

  // 🔥 NEW: Library Compatibility Method
  /**
   * Creates imported_items entries for backward compatibility with Library page
   */
  async createImportedItemsForLibrary(databases: ImportedDatabase[], projectId: string, userId: string): Promise<void> {
    try {
      const itemsToInsert = [];

      for (const database of databases) {
        for (const record of database.records) {
          itemsToInsert.push({
            id: `notion-${record.id}`,
            user_id: userId,
            project_id: projectId,
            type: this.mapRecordTypeToItemType(record.type),
            title: record.name,
            content: this.extractContentForLibrary(record),
            tags: this.extractTags(record.properties),
            word_count: this.estimateWordCount(record),
            imported_from: 'notion',
            imported_at: new Date().toISOString(),
            // Chapter-specific fields for Library compatibility
            ...(record.type === 'chapter' && {
              chapter_number: record.properties.Chapter || record.properties['Chapter '],
              status: this.mapChapterStatusForLibrary(record.properties.Status || ''),
            })
          });
        }
      }

      if (itemsToInsert.length > 0) {
        const { error } = await supabase.from('imported_items').insert(itemsToInsert);
        if (error) {
          console.error('Failed to create imported_items:', error);
        } else {
          console.log(`✅ Created ${itemsToInsert.length} imported_items for Library compatibility`);
        }
      }
    } catch (error) {
      console.error('Error creating imported_items:', error);
    }
  }

  // ===== OUTLINE CREATION =====
  private async createOutlineFromChapters(records: ImportedRecord[], projectId: string): Promise<number> {
    const chaptersByBook = this.groupChaptersByBook(records);
    let totalNodes = 0;

    for (const [bookName, chapters] of Object.entries(chaptersByBook)) {
      const { data: actNode, error } = await supabase
        .from('outline_nodes')
        .insert([{
          project_id: projectId,
          title: bookName || 'Imported Story',
          type: 'act',
          description: `Imported from Notion with ${chapters.length} chapters`,
          status: 'planned',
          order: 1,
        }])
        .select()
        .single();

      if (error) continue;
      totalNodes++;

      // Create chapter nodes
      for (const chapter of chapters) {
        const { error: chapterError } = await supabase
          .from('outline_nodes')
          .insert([{
            project_id: projectId,
            parent_id: actNode.id,
            title: chapter.name,
            type: 'chapter',
            description: chapter.properties.Notes || chapter.properties['Notes '] || '',
            order: chapter.properties.Chapter || chapter.properties['Chapter '] || 1,
          }]);

        if (!chapterError) totalNodes++;
      }
    }

    return totalNodes;
  }

  // ===== HELPER FUNCTIONS =====
  private extractAge(ageStr: string): number | undefined {
    const match = ageStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private buildDescription(record: ImportedRecord): string {
    const parts = [];
    if (record.properties.content) parts.push(record.properties.content);
    if (record.properties.Description) parts.push(record.properties.Description);
    return parts.join('\n\n');
  }

  private extractTraits(props: any): string[] {
    const traits = [];
    if (Array.isArray(props.Abilities)) traits.push(...props.Abilities);
    if (Array.isArray(props.Techniques)) traits.push(...props.Techniques);
    if (Array.isArray(props['Multi-select'])) traits.push(...props['Multi-select']);
    return [...new Set(traits)];
  }

  private extractTags(props: any): string[] {
    const tags = [];
    Object.entries(props).forEach(([key, value]) => {
      if (Array.isArray(value) && key.toLowerCase().includes('tag')) {
        tags.push(...value);
      } else if (typeof value === 'string' && value.length < 50) {
        if (['type', 'role', 'status'].some(k => key.toLowerCase().includes(k))) {
          tags.push(value);
        }
      }
    });
    return [...new Set(tags)];
  }

  private extractFantasyClass(props: any): string {
    const fields = ['Multi-select', 'Class', 'Fantasy Class', 'Role'];
    for (const field of fields) {
      if (props[field]) {
        return Array.isArray(props[field]) ? props[field].join(', ') : props[field];
      }
    }
    return '';
  }

  private extractContentForLibrary(record: ImportedRecord): string {
    const parts = [];
    if (record.content) parts.push(record.content);
    if (record.properties.Description) parts.push(record.properties.Description);
    
    // Add type-specific content
    if (record.type === 'character') {
      if (record.properties.Role) parts.push(`Role: ${record.properties.Role}`);
      if (record.properties.Age) parts.push(`Age: ${record.properties.Age}`);
    } else if (record.type === 'chapter') {
      if (record.properties.Status) parts.push(`Status: ${record.properties.Status}`);
      if (record.properties['Word Count']) parts.push(`Word Count: ${record.properties['Word Count']}`);
    }
    
    return parts.join('\n\n');
  }

  private mapRecordTypeToItemType(recordType: string): string {
    return { 'character': 'character', 'plot': 'plot', 'chapter': 'chapter', 'location': 'research' }[recordType] || 'research';
  }

  private mapChapterStatusForLibrary(status: string): string {
    const map = { 'Not started': 'draft', 'In progress': 'in_progress', 'Done': 'complete', 'Published': 'published' };
    return map[status] || 'draft';
  }

  private estimateWordCount(record: ImportedRecord): number {
    const content = record.properties.content || '';
    return content ? content.split(/\s+/).filter(word => word.length > 0).length : 0;
  }

  private mapNotionRoleToApp(role: string): string {
    const map = {
      'Main Character': 'protagonist', 'Protagonist': 'protagonist', 'Antagonist': 'antagonist',
      'Secondary Character': 'supporting', 'Supporting Character': 'supporting'
    };
    return map[role] || 'minor';
  }

  private mapPlotType(type: string): string {
    return { 'Main Plot': 'main', 'Sub Plot': 'subplot', 'Side Story': 'side_story' }[type] || 'subplot';
  }

  private getPlotColor(type: string): string {
    return { 'Main Plot': '#3B82F6', 'Sub Plot': '#10B981', 'Side Story': '#8B5CF6' }[type] || '#6B7280';
  }

  private parseProgress(progress: string): number {
    const match = progress.match(/(\d+)/);
    return match ? Math.min(100, Math.max(0, parseInt(match[1], 10))) : 0;
  }

  private mapChapterStatus(status: string): string {
    const map = { 'Not started': 'not_started', 'In progress': 'in_progress', 'Done': 'completed' };
    return map[status] || 'planned';
  }

  private mapStatus(status: string): string {
    return (status === 'Yes' || status === 'Done') ? 'completed' : 'in_progress';
  }

  private detectWorldElementCategory(record: ImportedRecord): string {
    const name = record.name.toLowerCase();
    const content = (record.properties.content || '').toLowerCase();
    
    if (name.includes('magic') || content.includes('magic')) return 'technology';
    if (name.includes('culture') || content.includes('culture')) return 'culture';
    if (name.includes('economy') || content.includes('economy')) return 'economy';
    return 'location';
  }

  private groupChaptersByBook(records: ImportedRecord[]): Record<string, ImportedRecord[]> {
    const groups: Record<string, ImportedRecord[]> = {};
    for (const record of records) {
      const bookName = this.extractBookName(record);
      if (!groups[bookName]) groups[bookName] = [];
      groups[bookName].push(record);
    }
    return groups;
  }

  private extractBookName(record: ImportedRecord): string {
    const props = record.properties;
    if (props.Books?.[0]) return props.Books[0];
    if (props['Books ']?.[0]) return props['Books '][0];
    return 'Imported Story';
  }

  private getTotalImported(imported: ImportResult['imported']): number {
    return Object.values(imported).reduce((sum, count) => sum + count, 0);
  }

  // ===== USER VALIDATION =====
  async canUserImport(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_status, trial_expires_at')
        .eq('id', userId)
        .single();

      if (!profile) return false;
      if (profile.subscription_status === 'active') return true;
      
      if (profile.trial_expires_at) {
        return new Date(profile.trial_expires_at) > new Date();
      }
      return false;
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }
}
