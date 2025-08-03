// src/services/notion-import-service.ts - UPDATED WITH PROXY SUPPORT

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
  private useProxy: boolean;
  private proxyUrl: string;
  
  constructor(token: string) {
    this.token = token;
    // Always use proxy in browser environment
    this.useProxy = typeof window !== 'undefined';
    this.proxyUrl = '/.netlify/functions/notion-proxy';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.useProxy) {
      return this.makeProxyRequest(endpoint, options);
    } else {
      return this.makeDirectRequest(endpoint, options);
    }
  }

  private async makeProxyRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log('🔍 Making proxy request to:', endpoint);

    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: options.method || 'GET',
        endpoint: endpoint,
        token: this.token,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      }),
    });

    const result = await response.json();
    
    console.log('📡 Proxy response:', {
      success: result.success,
      status: result.status,
      hasData: !!result.data,
    });

    if (!result.success) {
      const errorMessage = result.data?.message || `API error: ${result.status}`;
      
      if (result.status === 401) {
        throw new Error('Invalid Notion token. Please check your integration token.');
      } else if (result.status === 403) {
        throw new Error('Access denied. Make sure your databases are shared with the integration.');
      } else if (result.status === 404) {
        throw new Error('Database not found. Please check your database URLs.');
      } else {
        throw new Error(errorMessage);
      }
    }

    return result.data;
  }

  private async makeDirectRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    console.log('🔍 Making direct request to:', endpoint);

    const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `HTTP ${response.status}: ${response.statusText}` 
      }));
      
      if (response.status === 401) {
        throw new Error('Invalid Notion token. Please check your integration token.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Make sure your databases are shared with the integration.');
      } else if (response.status === 404) {
        throw new Error('Database not found. Please check your database URLs.');
      } else {
        throw new Error(error.message || `Notion API error: ${response.status}`);
      }
    }

    return response.json();
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    try {
      return await this.makeRequest(`/databases/${databaseId}`);
    } catch (error) {
      throw new Error(`Failed to access database ${databaseId}: ${error.message}`);
    }
  }

  async queryDatabase(databaseId: string, startCursor?: string): Promise<NotionQueryResponse> {
    const body: any = {
      page_size: 100,
    };

    if (startCursor) {
      body.start_cursor = startCursor;
    }

    try {
      return await this.makeRequest(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new Error(`Failed to query database ${databaseId}: ${error.message}`);
    }
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
        return property.rich_text?.map((t: any) => t.plain_text).join('') || '';
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
      case 'people':
        return property.people?.map((person: any) => person.name || person.id) || [];
      case 'files':
        return property.files?.map((file: any) => file.name || file.file?.url) || [];
      case 'created_time':
      case 'last_edited_time':
        return property[property.type];
      case 'created_by':
      case 'last_edited_by':
        return property[property.type]?.name || '';
      case 'formula':
        return this.extractPropertyValue(property.formula);
      case 'rollup':
        return property.rollup?.array?.map((item: any) => this.extractPropertyValue(item)) || [];
      default:
        return property;
    }
  }

  private detectDatabaseType(name: string, properties: Record<string, NotionProperty>): ImportedDatabase['type'] {
    const nameL = name.toLowerCase();
    const propKeys = Object.keys(properties).map(k => k.toLowerCase());
    
    // Character detection - prioritize specific character indicators
    if (nameL.includes('character') || 
        propKeys.some(k => 
          k.includes('role') || k.includes('age') || k.includes('race') || 
          k.includes('abilities') || k.includes('class') || k.includes('trait') ||
          k.includes('techniques') || k.includes('face claim')
        )) {
      return 'character';
    }
    
    // Plot detection
    if (nameL.includes('plot') || nameL.includes('story') ||
        propKeys.some(k => 
          k.includes('storyline') || k.includes('outline') || k.includes('progress') ||
          k.includes('arc') || k.includes('narrative')
        )) {
      return 'plot';
    }
    
    // Chapter detection
    if (nameL.includes('chapter') || nameL.includes('scene') ||
        propKeys.some(k => 
          k.includes('chapter') || k.includes('word count') || k.includes('title chapter') ||
          k.includes('scene') || k.includes('manuscript')
        )) {
      return 'chapter';
    }
    
    // Location detection
    if (nameL.includes('location') || nameL.includes('world') || nameL.includes('place') ||
        nameL.includes('setting') || nameL.includes('geography') ||
        propKeys.some(k => 
          k.includes('geography') || k.includes('culture') || k.includes('location') ||
          k.includes('climate') || k.includes('population') || k.includes('setting')
        )) {
      return 'location';
    }
    
    return 'unknown';
  }

  private mapNotionRecordToImported(page: NotionPage, dbType: ImportedDatabase['type']): ImportedRecord {
    const properties: Record<string, any> = {};
    let name = 'Untitled';
    let content = '';

    // Extract all properties
    Object.entries(page.properties).forEach(([key, value]) => {
      const extractedValue = this.extractPropertyValue(value);
      properties[key] = extractedValue;
      
      // Try to find the name/title
      if (value.type === 'title' || key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
        name = extractedValue || name;
      }
      
      // Extract content for description
      if (key.toLowerCase().includes('content') || key.toLowerCase().includes('description') || 
          key.toLowerCase().includes('note') || key.toLowerCase().includes('detail')) {
        content = extractedValue || content;
      }
    });

    return {
      id: page.id,
      name,
      properties,
      content,
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
      throw new Error(`Database import failed: ${error.message}`);
    }
  }

  async importFromMultipleDatabases(databaseUrls: string[]): Promise<ImportedDatabase[]> {
    const databaseIds = databaseUrls.map(url => this.extractDatabaseIdFromUrl(url));
    const databases: ImportedDatabase[] = [];
    const errors: string[] = [];

    for (const databaseId of databaseIds) {
      try {
        const database = await this.importFromDatabase(databaseId);
        databases.push(database);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to import database ${databaseId}:`, errorMessage);
        errors.push(`Database ${databaseId}: ${errorMessage}`);
      }
    }

    if (databases.length === 0 && errors.length > 0) {
      throw new Error(`All database imports failed:\n${errors.join('\n')}`);
    }

    return databases;
  }

  // 🔧 FIXED: Enhanced URL extraction method
  private extractDatabaseIdFromUrl(url: string): string {
    console.log('🔍 Extracting database ID from URL:', url);
    
    // Remove any trailing whitespace and normalize
    const cleanUrl = url.trim();
    
    // Handle view parameters by removing them
    const urlWithoutView = cleanUrl.split('?')[0];
    
    // Extract database ID from various Notion URL formats
    const patterns = [
      // Standard database URL with or without view parameter
      /notion\.so\/([a-f0-9]{32})(?:\?.*)?$/,
      // Database URL with title
      /notion\.so\/.+\/([a-f0-9]{32})(?:\?.*)?$/,
      // UUID format with hyphens
      /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/,
      // Raw UUID without hyphens
      /([a-f0-9]{32})/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        let id = match[1];
        // Remove hyphens from UUID format
        id = id.replace(/-/g, '');
        console.log('✅ Extracted database ID:', id);
        return id;
      }
    }

    // If no pattern matches, try extracting from URL path
    const pathSegments = cleanUrl.split('/');
    for (const segment of pathSegments.reverse()) {
      // Look for segments that look like Notion IDs
      const cleanSegment = segment.split('?')[0]; // Remove query params
      if (/^[a-f0-9]{32}$/.test(cleanSegment)) {
        console.log('✅ Extracted database ID from path:', cleanSegment);
        return cleanSegment;
      }
      if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(cleanSegment)) {
        const id = cleanSegment.replace(/-/g, '');
        console.log('✅ Extracted database ID from path (UUID):', id);
        return id;
      }
    }

    console.error('❌ Failed to extract database ID from URL:', url);
    throw new Error(`Invalid Notion database URL: ${url}. Please ensure you're using a valid Notion database URL.`);
  }

  // Helper method to validate token by making a test request
  async validateToken(): Promise<boolean> {
    try {
      console.log('🔍 Validating Notion token...');
      const response = await this.makeRequest('/users/me');
      console.log('✅ Token validation successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return false;
    }
  }

  // Helper method to validate token format
  private isValidTokenFormat(token: string): boolean {
    // Updated to accept both old and new Notion token formats
    const validFormats = [
      /^secret_[a-zA-Z0-9]{43}$/, // Old format: secret_xxx
      /^ntn_[a-zA-Z0-9]+$/, // New format: ntn_xxx
    ];
    
    return validFormats.some(format => format.test(token));
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
      age: this.extractAge(props['Age '] || props.Age || ''), // Handle "Age " with space
      description: record.content || props.Description || '',
      // Map specific character fields from your Notion schema
      race: Array.isArray(props['Race ']) 
        ? props['Race '][0] 
        : (props['Race '] || ''),
      abilities: Array.isArray(props.Abilities) ? props.Abilities : [],
      techniques: Array.isArray(props.Techniques) ? props.Techniques : [],
      fantasy_class: Array.isArray(props['Multi-select']) ? props['Multi-select'].join(', ') : '',
      appearance: props['Face Claim'] || '',
      backstory: record.content || '', // Your character content is rich backstory
      motivation: '', // Could be extracted from content if available
      personality: record.content || '', // Character personality in content
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
      description: record.content || props.Description || '',
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

  private static extractAge(ageStr: string): number | undefined {
    if (!ageStr) return undefined;
    const match = ageStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }
}
