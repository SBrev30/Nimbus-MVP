import { supabase, logSupabaseError } from '../lib/supabase';

export interface WorldElement {
  id: string;
  project_id?: string;
  user_id: string;
  title: string;
  category: 'location' | 'culture' | 'technology' | 'economy' | 'hierarchy';
  description: string;
  details?: string;
  tags: string[];
  image_urls: string[];
  connections: any; // JSONB field for connections to other elements
  metadata: any; // JSONB field for additional data
  created_at: string;
  updated_at: string;
}

export interface CreateWorldElementData {
  title: string;
  category: 'location' | 'culture' | 'technology' | 'economy' | 'hierarchy';
  description: string;
  details?: string;
  tags?: string[];
  image_urls?: string[];
  connections?: any;
  project_id?: string;
}

export interface UpdateWorldElementData extends Partial<CreateWorldElementData> {
  id: string;
}

export interface ImageUsageStats {
  totalSizeBytes: number;
  totalCount: number;
  remainingBytes: number;
  remainingCount: number;
}

class WorldBuildingService {
  // Constants for free tier limits
  private readonly FREE_TIER_MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
  private readonly MAX_IMAGES_PER_ELEMENT = 6;
  private readonly MAX_SINGLE_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image max

  async getWorldElements(projectId?: string): Promise<WorldElement[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('world_elements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.getWorldElements');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching world elements:', error);
      throw error;
    }
  }

  async getWorldElement(id: string): Promise<WorldElement | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('world_elements')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        logSupabaseError(error, 'WorldBuildingService.getWorldElement');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching world element:', error);
      throw error;
    }
  }

  async createWorldElement(elementData: CreateWorldElementData): Promise<WorldElement> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newElement = {
        ...elementData,
        user_id: user.id,
        tags: elementData.tags || [],
        image_urls: elementData.image_urls || [],
        connections: elementData.connections || {},
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('world_elements')
        .insert([newElement])
        .select()
        .single();

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.createWorldElement');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating world element:', error);
      throw error;
    }
  }

  async updateWorldElement(id: string, updates: Partial<CreateWorldElementData>): Promise<WorldElement> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('world_elements')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.updateWorldElement');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating world element:', error);
      throw error;
    }
  }

  async deleteWorldElement(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the element to clean up images
      const element = await this.getWorldElement(id);
      if (element?.image_urls) {
        // Clean up images from storage
        for (const imageUrl of element.image_urls) {
          try {
            await this.deleteImage(imageUrl);
          } catch (error) {
            console.warn('Failed to delete image during element deletion:', error);
          }
        }
      }

      const { error } = await supabase
        .from('world_elements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.deleteWorldElement');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting world element:', error);
      throw error;
    }
  }

  async searchWorldElements(query: string, projectId?: string): Promise<WorldElement[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let supabaseQuery = supabase
        .from('world_elements')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,details.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (projectId) {
        supabaseQuery = supabaseQuery.eq('project_id', projectId);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.searchWorldElements');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching world elements:', error);
      throw error;
    }
  }

  async getWorldElementsByCategory(category: string, projectId?: string): Promise<WorldElement[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('world_elements')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.getWorldElementsByCategory');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching world elements by category:', error);
      throw error;
    }
  }

  async getUserImageUsage(): Promise<ImageUsageStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all user's world elements with images
      const elements = await this.getWorldElements();
      
      let totalSizeBytes = 0;
      let totalCount = 0;

      // Calculate total usage across all elements
      for (const element of elements) {
        if (element.image_urls && element.image_urls.length > 0) {
          totalCount += element.image_urls.length;
          
          // For size calculation, we'll need to get file info from storage
          // For now, we'll estimate based on average file sizes or store metadata
          // This is a simplified approach - in production you'd want to track actual sizes
          for (const imageUrl of element.image_urls) {
            try {
              const filename = this.extractFilenameFromUrl(imageUrl);
              if (filename) {
                const { data: fileData, error } = await supabase.storage
                  .from('world-building-images')
                  .list(user.id, { search: filename });
                
                if (fileData && fileData.length > 0) {
                  const file = fileData.find(f => f.name === filename.split('/').pop());
                  if (file?.metadata?.size) {
                    totalSizeBytes += file.metadata.size;
                  }
                }
              }
            } catch (error) {
              console.warn('Error getting file size for:', imageUrl, error);
            }
          }
        }
      }

      const remainingBytes = Math.max(0, this.FREE_TIER_MAX_TOTAL_SIZE - totalSizeBytes);
      const remainingCount = Math.max(0, 100 - totalCount); // Assume max 100 images total

      return {
        totalSizeBytes,
        totalCount,
        remainingBytes,
        remainingCount
      };
    } catch (error) {
      console.error('Error calculating image usage:', error);
      throw error;
    }
  }

  private extractFilenameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename || null;
    } catch {
      return null;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // Validate file size (max 10MB per individual image)
      if (file.size > this.MAX_SINGLE_IMAGE_SIZE) {
        throw new Error('Individual image size cannot exceed 10MB');
      }

      // Validate file type
      if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
        throw new Error('Only PNG and JPEG images are allowed');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check total usage before uploading
      const usage = await this.getUserImageUsage();
      if (usage.totalSizeBytes + file.size > this.FREE_TIER_MAX_TOTAL_SIZE) {
        const remainingMB = Math.round(usage.remainingBytes / (1024 * 1024) * 10) / 10;
        const fileMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
        throw new Error(`Upload would exceed 50MB limit. You have ${remainingMB}MB remaining, but this file is ${fileMB}MB.`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('world-building-images')
        .upload(fileName, file, {
          metadata: {
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString()
          }
        });

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.uploadImage');
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('world-building-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const filename = this.extractFilenameFromUrl(imageUrl);
      if (!filename) return;

      const { error } = await supabase.storage
        .from('world-building-images')
        .remove([filename]);

      if (error) {
        logSupabaseError(error, 'WorldBuildingService.deleteImage');
        // Don't throw error for image deletion failures, just log
        console.warn('Failed to delete image:', error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for image deletion failures
    }
  }
}

export const worldBuildingService = new WorldBuildingService();
