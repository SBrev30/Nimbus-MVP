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

class WorldBuildingService {
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

  // Helper method for image upload (you'll need to implement actual upload logic)
  async uploadImage(file: File): Promise<string> {
    try {
      // Validate file size (max 50MB as requested)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 50MB limit');
      }

      // Validate file type
      if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
        throw new Error('Only PNG and JPEG images are allowed');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('world-building-images')
        .upload(fileName, file);

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
      const filename = imageUrl.split('/').pop();
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
