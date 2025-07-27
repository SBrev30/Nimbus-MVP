// src/services/enhanced-supabase-import-service.ts

import { supabase } from '../lib/supabase';
import { DatabaseMapper, ImportedDatabase, ImportedRecord } from './notion-import-service';

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
      imported: {
        characters: 0,
        plotThreads: 0,
        chapters: 0,
        locations: 0,
        worldElements: 0,
        outlineNodes: 0,
      },
      errors: [],
      planningPageDistribution: {
        charactersPage: [],
        plotPage: [],
        worldBuildingPage: [],
        outlinePage: [],
      },
    };

    try {
      // Create project first
      const project = await this.createProject(projectName, userId);
      result.projectId = project.id;

      // Process each database type with intelligent distribution
      for (const database of databases) {
        try {
          await this.importDatabaseWithDistribution(database, project.id, result);
        } catch (error) {
          console.error(`Failed to import database ${database.name}:`, error);
          result.errors.push(`Failed to import ${database.name}: ${error.message}`);
        }
      }

      result.success = result.errors.length === 0 || 
        this.getTotalImported(result.imported) > 0;

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

  private async importDatabaseWithDistribution(
    database: ImportedDatabase, 
    projectId: string, 
    result: ImportResult
  ) {
    switch (database.type) {
      case 'character':
        await this.importCharacters(database.records, projectId, result);
        break;
      case 'plot':
        await this.importPlots(database.records, projectId, result);
        break;
      case 'chapter':
        await this.importChaptersWithDistribution(database.records, projectId, result);
        break;
      case 'location':
        await this.importLocationsWithDistribution(database.records, projectId, result);
        break;
      default:
        console.log(`Processing unknown database type as world element: ${database.type}`);
        await this.importAsWorldElements(database.records, projectId, result);
    }
  }

  // ===== CHARACTER IMPORT (Characters Page) =====
  private async importCharacters(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const charactersToInsert = records.map(record => 
      this.mapNotionCharacterToSupabase(record, projectId)
    );

    const { data, error } = await supabase
      .from('characters')
      .insert(charactersToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to import characters: ${error.message}`);
    }

    result.imported.characters = data?.length || 0;
    result.planningPageDistribution.charactersPage.push(
      `${result.imported.characters} characters imported with roles, abilities, and detailed descriptions`
    );
  }

  // ===== PLOT IMPORT (Plot Page) =====
  private async importPlots(records: ImportedRecord[], projectId: string, result: ImportResult) {
    if (records.length === 0) return;

    const plotThreadsToInsert = records.map(record => 
      this.mapNotionPlotToSupabase(record, projectId)
    );

    const { data, error } = await supabase
      .from('plot_threads')
      .insert(plotThreadsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to import plot threads: ${error.message}`);
    }

    result.imported.plotThreads = data?.length || 0;
    result.planningPageDistribution.plotPage.push(
      `${result.imported.plotThreads} plot threads imported with progress tracking and tension curves`
    );
  }

  // ===== CHAPTER IMPORT (Dual Distribution: Outline + Chapters) =====
  private async importChaptersWithDistribution(
    records: ImportedRecord[], 
    projectId: string, 
    result: ImportResult
  ) {
    if (records.length === 0) return;

    // Import to chapters table
    const chaptersToInsert = records.map(record => 
      this.mapNotionChapterToSupabase(record, projectId)
    );

    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert)
      .select();

    if (chaptersError) {
      throw new Error(`Failed to import chapters: ${chaptersError.message}`);
    }

    result.imported.chapters = chaptersData?.length || 0;

    // Also create outline structure if chapters have hierarchical information
    const outlineNodes = await this.createOutlineFromChapters(records, projectId);
    result.imported.outlineNodes = outlineNodes;

    result.planningPageDistribution.outlinePage.push(
      `${result.imported.chapters} chapters organized into ${outlineNodes} outline nodes with word count tracking`
    );
  }

  // ===== LOCATION IMPORT (Dual Distribution: World Building + Locations) =====
  private async importLocationsWithDistribution(
    records: ImportedRecord[], 
    projectId: string, 
    result: ImportResult
  ) {
    if (records.length === 0) return;

    // Import to locations table
    const locationsToInsert = records.map(record => 
      this.mapNotionLocationToSupabase(record, projectId)
    );

    const { data: locationsData, error: locationsError } = await supabase
      .from('locations')
      .insert(locationsToInsert)
      .select();

    if (locationsError) {
      throw new Error(`Failed to import locations: ${locationsError.message}`);
    }

    result.imported.locations = locationsData?.length || 0;

    // Also import as world elements for rich world building
    const worldElementsToInsert = records.map(record => 
      this.mapNotionLocationToWorldElement(record, projectId)
    );

    const { data: worldElementsData, error: worldElementsError } = await supabase
      .from('world_elements')
      .insert(worldElementsToInsert)
      .select();

    if (worldElementsError) {
      console.warn('Failed to import as world elements:', worldElementsError.message);
    } else {
      result.imported.worldElements = worldElementsData?.length || 0;
    }

    result.planningPageDistribution.worldBuildingPage.push(
      `${result.imported.locations} locations imported with geography, culture, and world-building details`
    );
  }

  // ===== UNKNOWN CONTENT (World Building Page) =====
  private async importAsWorldElements(
    records: ImportedRecord[], 
    projectId: string, 
    result: ImportResult
  ) {
    if (records.length === 0) return;

    const worldElementsToInsert = records.map(record => 
      this.mapNotionRecordToWorldElement(record, projectId)
    );

    const { data, error } = await supabase
      .from('world_elements')
      .insert(worldElementsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to import world elements: ${error.message}`);
    }

    result.imported.worldElements += data?.length || 0;
    result.planningPageDistribution.worldBuildingPage.push(
      `${data?.length} miscellaneous elements imported as world-building content`
    );
  }

  // ===== MAPPING FUNCTIONS =====

  private mapNotionCharacterToSupabase(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-char-${record.id}`,
      project_id: projectId,
      name: record.name,
      role: this.mapNotionRoleToApp(props.Role || props.Type || ''),
      age: this.extractAge(props.Age || props['Age '] || ''),
      description: this.buildCharacterDescription(record, props),
      background: props.Background || props.Backstory || '',
      physical_description: props['Face Claim'] || props.Appearance || '',
      occupation: props.Occupation || '',
      traits: this.extractTraits(props),
      tags: this.extractTags(props),
      // Enhanced Notion-specific fields
      fantasy_class: this.extractFantasyClass(props),
      motivation: this.extractFromContent(record, 'motivation') || '',
      personality: this.extractFromContent(record, 'personality') || '',
      relationships: this.extractRelationships(props),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private mapNotionPlotToSupabase(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-plot-${record.id}`,
      project_id: projectId,
      title: record.name,
      description: props.content || record.properties.Description || '',
      type: this.mapPlotType(props.Stats || props.Type || 'subplot'),
      status: this.mapStatus(props.Finished || props.Status || 'in_progress'),
      color: this.getPlotColor(props.Stats || props.Type),
      tension_start: 1,
      tension_end: this.calculateTensionFromProgress(props.Progress),
      completion_percentage: this.parseProgress(props.Progress || '0%'),
      tags: this.extractTags(props),
      connected_character_ids: this.extractConnectedCharacters(props),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private mapNotionChapterToSupabase(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-chapter-${record.id}`,
      project_id: projectId,
      title: record.name,
      chapter_number: props.Chapter || props['Chapter '] || 0,
      description: props.Notes || props['Notes '] || props.Description || '',
      status: this.mapChapterStatus(props.Status || 'not_started'),
      word_count: props['Word Count'] || 0,
      type: this.mapChapterType(props),
      significance: this.mapSignificance(props),
      order: props.Chapter || props['Chapter '] || 0,
      target_word_count: this.estimateTargetWordCount(props),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private mapNotionLocationToSupabase(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-loc-${record.id}`,
      project_id: projectId,
      name: record.name,
      description: props.content || props.Description || '',
      geography: props.Geography || this.extractFromContent(record, 'geography') || '',
      culture: props.Culture || this.extractFromContent(record, 'culture') || '',
      climate: props.Climate || this.extractFromContent(record, 'climate') || '',
      population: props.Population || this.extractFromContent(record, 'population') || '',
      government: props.Government || this.extractFromContent(record, 'government') || '',
      economy: props.Economy || this.extractFromContent(record, 'economy') || '',
      notable_features: props['Notable Features'] || this.extractFromContent(record, 'features') || '',
      connected_characters: this.extractConnectedCharacters(props),
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private mapNotionLocationToWorldElement(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-world-${record.id}`,
      project_id: projectId,
      title: record.name,
      category: 'location',
      description: props.content || props.Description || '',
      details: this.buildLocationDetails(props),
      tags: this.extractTags(props),
      connections: this.extractConnections(props),
      image_urls: this.extractImageUrls(props),
      metadata: {
        original_notion_data: props,
        geography: props.Geography,
        culture: props.Culture,
        climate: props.Climate,
      },
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private mapNotionRecordToWorldElement(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-world-${record.id}`,
      project_id: projectId,
      title: record.name,
      category: this.detectWorldElementCategory(record, props),
      description: props.content || props.Description || '',
      details: JSON.stringify(props, null, 2),
      tags: this.extractTags(props),
      connections: [],
      image_urls: this.extractImageUrls(props),
      metadata: {
        original_notion_data: props,
        detected_type: record.type,
      },
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  // ===== OUTLINE CREATION FROM CHAPTERS =====
  private async createOutlineFromChapters(
    records: ImportedRecord[], 
    projectId: string
  ): Promise<number> {
    // Group chapters by book/act if available
    const chaptersByBook = this.groupChaptersByBook(records);
    let totalNodes = 0;

    for (const [bookName, chapters] of Object.entries(chaptersByBook)) {
      // Create act node
      const actData = {
        project_id: projectId,
        title: bookName || 'Imported Story',
        type: 'act' as const,
        description: `Imported from Notion with ${chapters.length} chapters`,
        status: 'planned' as const,
        order: 1,
        word_count_target: chapters.reduce((sum, ch) => sum + (ch.properties['Word Count'] || 0), 0),
        word_count_current: chapters.reduce((sum, ch) => sum + (ch.properties['Word Count'] || 0), 0),
      };

      const { data: actNode, error: actError } = await supabase
        .from('outline_nodes')
        .insert([actData])
        .select()
        .single();

      if (actError) {
        console.warn('Failed to create act node:', actError.message);
        continue;
      }

      totalNodes++;

      // Create chapter nodes under the act
      for (const chapter of chapters) {
        const chapterData = {
          project_id: projectId,
          parent_id: actNode.id,
          title: chapter.name,
          type: 'chapter' as const,
          description: chapter.properties.Notes || chapter.properties['Notes '] || '',
          status: this.mapStatusToOutline(chapter.properties.Status),
          order: chapter.properties.Chapter || chapter.properties['Chapter '] || 1,
          word_count_target: chapter.properties['Word Count'] || 0,
          word_count_current: chapter.properties['Word Count'] || 0,
        };

        const { error: chapterError } = await supabase
          .from('outline_nodes')
          .insert([chapterData]);

        if (!chapterError) {
          totalNodes++;
        }
      }
    }

    return totalNodes;
  }

  // ===== HELPER FUNCTIONS =====

  private extractAge(ageStr: string): number | undefined {
    if (!ageStr) return undefined;
    const match = ageStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private buildCharacterDescription(record: ImportedRecord, props: any): string {
    const parts = [];
    
    if (props.content) parts.push(props.content);
    if (props.Description) parts.push(props.Description);
    if (props.Personality) parts.push(`Personality: ${props.Personality}`);
    if (props.Motivation) parts.push(`Motivation: ${props.Motivation}`);
    
    return parts.join('\n\n');
  }

  private extractTraits(props: any): string[] {
    const traits = [];
    
    if (Array.isArray(props.Abilities)) traits.push(...props.Abilities);
    if (Array.isArray(props.Techniques)) traits.push(...props.Techniques);
    if (Array.isArray(props.Traits)) traits.push(...props.Traits);
    if (Array.isArray(props['Multi-select'])) traits.push(...props['Multi-select']);
    
    return [...new Set(traits)];
  }

  private extractTags(props: any): string[] {
    const tags = [];
    
    // Extract from various tag-like fields
    Object.entries(props).forEach(([key, value]) => {
      if (key.toLowerCase().includes('tag') && Array.isArray(value)) {
        tags.push(...value);
      } else if (typeof value === 'string' && value.length < 50) {
        // Short string values might be tags
        if (key.toLowerCase().includes('type') || 
            key.toLowerCase().includes('role') || 
            key.toLowerCase().includes('status')) {
          tags.push(value);
        }
      }
    });
    
    return [...new Set(tags)];
  }

  private extractFantasyClass(props: any): string {
    const classFields = ['Multi-select', 'Class', 'Fantasy Class', 'Role'];
    
    for (const field of classFields) {
      if (props[field]) {
        if (Array.isArray(props[field])) {
          return props[field].join(', ');
        }
        return props[field];
      }
    }
    
    return '';
  }

  private extractFromContent(record: ImportedRecord, keyword: string): string {
    const content = record.properties.content || '';
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        return line.trim();
      }
    }
    
    return '';
  }

  private extractRelationships(props: any): any[] {
    const relationships = [];
    
    if (props.Relationships && Array.isArray(props.Relationships)) {
      relationships.push(...props.Relationships);
    }
    
    if (props.relationships && typeof props.relationships === 'object') {
      relationships.push(props.relationships);
    }
    
    return relationships;
  }

  private mapNotionRoleToApp(notionRole: string): string {
    const roleMap: Record<string, string> = {
      'Main Character': 'protagonist',
      'Secondary Character': 'supporting', 
      'Minor Character': 'minor',
      'Supported Character': 'supporting',
      'Protagonist': 'protagonist',
      'Antagonist': 'antagonist',
      'Deuteragonist': 'supporting',
      'Tertagonists': 'supporting',
      'Foil Character': 'supporting',
      'Confidant': 'supporting',
      'Love Interest': 'supporting',
    };
    return roleMap[notionRole] || 'minor';
  }

  private mapPlotType(notionType: string): string {
    const typeMap: Record<string, string> = {
      'Main Plot': 'main',
      'Sub Plot': 'subplot',
      'Subplot': 'subplot',
      'Side Story': 'side_story',
      'Character Arc': 'character_arc',
    };
    return typeMap[notionType] || 'subplot';
  }

  private getPlotColor(plotType: string): string {
    const colorMap: Record<string, string> = {
      'Main Plot': '#3B82F6',
      'Sub Plot': '#10B981', 
      'Subplot': '#10B981',
      'Side Story': '#8B5CF6',
      'Character Arc': '#F59E0B',
    };
    return colorMap[plotType] || '#6B7280';
  }

  private calculateTensionFromProgress(progress: string): number {
    const progressNum = this.parseProgress(progress);
    return Math.min(10, Math.max(1, Math.round(progressNum / 10)));
  }

  private parseProgress(progressStr: string): number {
    if (!progressStr) return 0;
    
    const match = progressStr.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, num));
    }
    
    return 0;
  }

  private mapChapterStatus(notionStatus: string): string {
    const statusMap: Record<string, string> = {
      'Not started': 'not_started',
      'In progress': 'in_progress',
      'Rough Editing': 'draft', 
      'Final Editing': 'editing',
      'Done': 'completed',
      'Published': 'complete',
    };
    return statusMap[status] || 'planned';
  }

  private getTotalImported(imported: ImportResult['imported']): number {
    return imported.characters + imported.plotThreads + imported.chapters + 
           imported.locations + imported.worldElements + imported.outlineNodes;
  }

  // ===== USER PERMISSION VALIDATION =====
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

  // ===== VALIDATION METHODS =====
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

  // ===== LEGACY COMPATIBILITY =====
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
      tags: this.extractTags(record.properties),
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
      'unknown': 'research',
    };
    return typeMap[recordType] || 'research';
  }

  private estimateWordCount(record: ImportedRecord): number {
    const content = record.properties.content || '';
    if (!content) return 0;
    
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }
} 'completed',
    };
    return statusMap[notionStatus] || 'not_started';
  }

  private mapChapterType(props: any): string {
    // Try to detect chapter type from content
    const content = (props.content || '').toLowerCase();
    const title = (props.title || '').toLowerCase();
    
    if (content.includes('climax') || title.includes('climax')) return 'climax';
    if (content.includes('twist') || title.includes('twist')) return 'twist';
    if (content.includes('resolution') || title.includes('resolution')) return 'resolution';
    if (content.includes('event') || title.includes('event')) return 'event';
    
    return 'event';
  }

  private mapSignificance(props: any): string {
    const chapterNum = props.Chapter || props['Chapter '] || 0;
    
    // First and last chapters are typically high significance
    if (chapterNum === 1) return 'high';
    if (props.Status === 'Done' && props['Word Count'] > 5000) return 'high';
    if (props.Notes && props.Notes.toLowerCase().includes('important')) return 'high';
    
    return 'medium';
  }

  private estimateTargetWordCount(props: any): number {
    const currentWordCount = props['Word Count'] || 0;
    
    // If already has word count, use it as target
    if (currentWordCount > 0) return currentWordCount;
    
    // Estimate based on chapter number and type
    const chapterNum = props.Chapter || props['Chapter '] || 1;
    if (chapterNum === 1) return 3000; // First chapters often longer
    
    return 2500; // Default target
  }

  private buildLocationDetails(props: any): string {
    const details = [];
    
    if (props.Geography) details.push(`Geography: ${props.Geography}`);
    if (props.Culture) details.push(`Culture: ${props.Culture}`);
    if (props.Climate) details.push(`Climate: ${props.Climate}`);
    if (props.Population) details.push(`Population: ${props.Population}`);
    if (props.Government) details.push(`Government: ${props.Government}`);
    if (props.Economy) details.push(`Economy: ${props.Economy}`);
    
    return details.join('\n\n');
  }

  private detectWorldElementCategory(record: ImportedRecord, props: any): string {
    const name = record.name.toLowerCase();
    const content = (props.content || '').toLowerCase();
    
    if (name.includes('magic') || content.includes('magic') || 
        name.includes('technology') || content.includes('technology')) {
      return 'technology';
    }
    
    if (name.includes('culture') || content.includes('culture') ||
        name.includes('society') || content.includes('society')) {
      return 'culture';
    }
    
    if (name.includes('economy') || content.includes('economy') ||
        name.includes('trade') || content.includes('money')) {
      return 'economy';
    }
    
    if (name.includes('hierarchy') || content.includes('hierarchy') ||
        name.includes('power') || content.includes('government')) {
      return 'hierarchy';
    }
    
    return 'location'; // Default fallback
  }

  private extractConnectedCharacters(props: any): string[] {
    const characters = [];
    
    if (props.Characters && Array.isArray(props.Characters)) {
      characters.push(...props.Characters);
    }
    
    if (props[' Characters '] && Array.isArray(props[' Characters '])) {
      characters.push(...props[' Characters ']);
    }
    
    return characters;
  }

  private extractConnections(props: any): string[] {
    const connections = [];
    
    // Look for relationship or connection fields
    Object.entries(props).forEach(([key, value]) => {
      if (key.toLowerCase().includes('connect') || 
          key.toLowerCase().includes('relation') ||
          key.toLowerCase().includes('link')) {
        if (Array.isArray(value)) {
          connections.push(...value);
        } else if (typeof value === 'string') {
          connections.push(value);
        }
      }
    });
    
    return connections;
  }

  private extractImageUrls(props: any): string[] {
    const urls = [];
    
    Object.entries(props).forEach(([key, value]) => {
      if (key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('photo') ||
          key.toLowerCase().includes('picture')) {
        if (typeof value === 'string' && value.startsWith('http')) {
          urls.push(value);
        }
      }
    });
    
    return urls;
  }

  private groupChaptersByBook(records: ImportedRecord[]): Record<string, ImportedRecord[]> {
    const groups: Record<string, ImportedRecord[]> = {};
    
    for (const record of records) {
      const bookName = this.extractBookName(record);
      if (!groups[bookName]) {
        groups[bookName] = [];
      }
      groups[bookName].push(record);
    }
    
    return groups;
  }

  private extractBookName(record: ImportedRecord): string {
    const props = record.properties;
    
    if (props.Books && Array.isArray(props.Books) && props.Books.length > 0) {
      return props.Books[0];
    }
    
    if (props['Books '] && Array.isArray(props['Books ']) && props['Books '].length > 0) {
      return props['Books '][0];
    }
    
    return 'Imported Story';
  }

  private mapStatus(status: string): string {
    if (status === 'Yes' || status === 'Done' || status === 'Completed') {
      return 'completed';
    }
    return 'in_progress';
  }

  private mapStatusToOutline(status: string): 'planned' | 'drafted' | 'revision' | 'complete' {
    const statusMap: Record<string, 'planned' | 'drafted' | 'revision' | 'complete'> = {
      'Not started': 'planned',
      'In progress': 'drafted',
      'Rough Editing': 'revision',
      'Final Editing': 'revision',
      'Done': 'complete',
      'Published':
