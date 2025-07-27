// src/services/notion-import-service.ts

interface NotionProperty {
  id: string;
  type: string;
  name: string;
}

interface NotionDatabase {
  object: 'database';
  id: string;
  title: Array<{ plain_text: string }>;
  properties: Record<string, NotionProperty>;
}

interface NotionPage {
  object: 'page';
  id: string;
  properties: Record<string, any>;
  parent: { database_id: string };
}

interface NotionQueryResponse {
  object: 'list';
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

export interface ImportedRecord {
  id: string;
  name: string;
  properties: Record<string, any>;
  content?: string;
  type: 'character' | 'plot' | 'chapter' | 'location' | 'unknown';
}

export interface ImportedDatabase {
  id: string;
  name: string;
  type: 'character' | 'plot' | 'chapter' | 'location' | 'unknown';
  properties: Record<string, NotionProperty>;
  records: ImportedRecord[];
}

export class NotionImportService {
  private token: string;
  private baseUrl = 'https://api.notion.com/v1';
  
  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Notion API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    return this.makeRequest(`/databases/${databaseId}`);
  }

  async queryDatabase(databaseId: string, startCursor?: string): Promise<NotionQueryResponse> {
    const body: any = {
      page_size: 100,
    };

    if (startCursor) {
      body.start_cursor = startCursor;
    }

    return this.makeRequest(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getAllDatabaseRecords(databaseId: string): Promise<NotionPage[]> {
    const allRecords: NotionPage[] = [];
    let hasMore = true;
    let nextCursor: string | undefined;

    while (hasMore) {
      const response = await this.queryDatabase(databaseId, nextCursor);
      allRecords.push(...response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }

    return allRecords;
  }

  private extractPropertyValue(property: any): any {
    if (!property) return null;

    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return property.number;
      case 'select':
        return property.select?.name || '';
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name) || [];
      case 'date':
        return property.date?.start || null;
      case 'checkbox':
        return property.checkbox;
      case 'url':
        return property.url;
      case 'email':
        return property.email;
      case 'phone_number':
        return property.phone_number;
      case 'relation':
        return property.relation?.map((item: any) => item.id) || [];
      case 'created_time':
      case 'last_edited_time':
        return property[property.type];
      case 'created_by':
      case 'last_edited_by':
        return property[property.type]?.name || '';
      default:
        return property;
    }
  }

  private detectDatabaseType(name: string, properties: Record<string, NotionProperty>): ImportedDatabase['type'] {
    const nameL = name.toLowerCase();
    const propKeys = Object.keys(properties).map(k => k.toLowerCase());
    
    // Character detection
    if (nameL.includes('character') || 
        propKeys.some(k => k.includes('role') || k.includes('age') || k.includes('race') || k.includes('abilities'))) {
      return 'character';
    }
    
    // Plot detection
    if (nameL.includes('plot') || 
        propKeys.some(k => k.includes('storyline') || k.includes('outline') || k.includes('progress'))) {
      return 'plot';
    }
    
    // Chapter detection
    if (nameL.includes('chapter') || 
        propKeys.some(k => k.includes('chapter') || k.includes('word count') || k.includes('title chapter'))) {
      return 'chapter';
    }
    
    // Location detection
    if (nameL.includes('location') || nameL.includes('world') || nameL.includes('place') ||
        propKeys.some(k => k.includes('geography') || k.includes('culture') || k.includes('location'))) {
      return 'location';
    }
    
    return 'unknown';
  }

  private mapNotionRecordToImported(page: NotionPage, dbType: ImportedDatabase['type']): ImportedRecord {
    const properties: Record<string, any> = {};
    let name = 'Untitled';

    // Extract all properties
    Object.entries(page.properties).forEach(([key, value]) => {
      const extractedValue = this.extractPropertyValue(value);
      properties[key] = extractedValue;
      
      // Try to find the name/title
      if (value.type === 'title' || key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
        name = extractedValue || name;
      }
    });

    return {
      id: page.id,
      name,
      properties,
      type: dbType,
    };
  }

  async importFromDatabase(databaseId: string): Promise<ImportedDatabase> {
    try {
      // Get database metadata
      const database = await this.getDatabase(databaseId);
      const dbName = database.title?.[0]?.plain_text || 'Untitled Database';
      const dbType = this.detectDatabaseType(dbName, database.properties);

      // Get all records
      const pages = await this.getAllDatabaseRecords(databaseId);
      
      // Convert pages to imported records
      const records = pages.map(page => this.mapNotionRecordToImported(page, dbType));

      return {
        id: databaseId,
        name: dbName,
        type: dbType,
        properties: database.properties,
        records,
      };
    } catch (error) {
      console.error(`Failed to import database ${databaseId}:`, error);
      throw error;
    }
  }

  async importFromMultipleDatabases(databaseUrls: string[]): Promise<ImportedDatabase[]> {
    const databaseIds = databaseUrls.map(url => this.extractDatabaseIdFromUrl(url));
    const databases: ImportedDatabase[] = [];

    for (const databaseId of databaseIds) {
      try {
        const database = await this.importFromDatabase(databaseId);
        databases.push(database);
      } catch (error) {
        console.error(`Failed to import database ${databaseId}:`, error);
        // Continue with other databases even if one fails
      }
    }

    return databases;
  }

  private extractDatabaseIdFromUrl(url: string): string {
    // Extract database ID from various Notion URL formats
    const patterns = [
      /notion\.so\/([a-f0-9]{32})/,           // Standard database URL
      /notion\.so\/.+\/([a-f0-9]{32})/,       // Database URL with title
      /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/, // UUID format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const id = match[1];
        // Remove hyphens from UUID format
        return id.replace(/-/g, '');
      }
    }

    throw new Error(`Invalid Notion database URL: ${url}`);
  }

  // Helper method to validate token by making a test request
  async validateToken(): Promise<boolean> {
    try {
      await this.makeRequest('/users/me');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Database mapping utilities for your app's schema
export class DatabaseMapper {
  static mapCharacterToApp(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-char-${record.id}`,
      project_id: projectId,
      name: record.name,
      role: this.mapNotionRoleToApp(props.Role || props.Type || ''),
      age: props.Age || props['Age '] || '',
      description: props.content || '',
      // Map specific character fields
      race: Array.isArray(props.Race || props['Race ']) 
        ? (props.Race || props['Race '])[0] 
        : (props.Race || props['Race '] || ''),
      abilities: Array.isArray(props.Abilities) ? props.Abilities : [],
      techniques: Array.isArray(props.Techniques) ? props.Techniques : [],
      fantasy_class: Array.isArray(props['Multi-select']) ? props['Multi-select'].join(', ') : '',
      appearance: props['Face Claim'] || '',
      backstory: '', // Could be extracted from content if available
      motivation: '', // Could be extracted from content if available
      personality: '', // Could be extracted from content if available
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  static mapPlotToApp(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-plot-${record.id}`,
      project_id: projectId,
      name: record.name,
      description: props.content || '',
      progress: props.Progress || '',
      storyline: props.Storyline || '',
      stats: props.Stats || '',
      status: props.Finished ? 'completed' : 'in_progress',
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  static mapChapterToApp(record: ImportedRecord, projectId: string) {
    const props = record.properties;
    
    return {
      id: `${projectId}-chapter-${record.id}`,
      project_id: projectId,
      title: record.name,
      chapter_number: props.Chapter || props['Chapter '] || 0,
      description: props.Notes || props['Notes '] || '',
      status: this.mapNotionStatusToApp(props.Status || ''),
      word_count: props['Word Count'] || 0,
      published: props.Published === 'Yes' || props.Published === true,
      imported_from: 'notion',
      imported_at: new Date().toISOString(),
    };
  }

  private static mapNotionRoleToApp(notionRole: string): string {
    const roleMap: Record<string, string> = {
      'Main Character': 'protagonist',
      'Secondary Character': 'secondary', 
      'Minor Character': 'minor',
      'Supported Character': 'secondary',
      'Protagonist': 'protagonist',
      'Antagonist': 'antagonist',
      'Deuteragonist': 'secondary',
      'Tertagonists': 'secondary',
      'Foil Character': 'secondary',
      'Confidant': 'secondary',
      'Love Interest': 'secondary',
    };
    return roleMap[notionRole] || 'other';
  }

  private static mapNotionStatusToApp(notionStatus: string): string {
    const statusMap: Record<string, string> = {
      'Not started': 'not_started',
      'In progress': 'in_progress',
      'Rough Editing': 'draft', 
      'Final Editing': 'editing',
      'Done': 'completed',
    };
    return statusMap[notionStatus] || 'not_started';
  }
}
