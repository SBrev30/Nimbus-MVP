// src/services/outlineService.ts
import { supabase } from '../lib/supabase';

export interface OutlineNode {
  id: string;
  projectId: string;
  parentId?: string;
  title: string;
  description: string;
  type: 'act' | 'chapter' | 'scene';
  orderIndex: number;
  wordCountTarget: number;
  wordCountCurrent: number;
  status: 'planned' | 'drafted' | 'revision' | 'complete';
  children?: OutlineNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutlineNodeData {
  projectId: string;
  parentId?: string;
  title: string;
  description: string;
  type: 'act' | 'chapter' | 'scene';
  wordCountTarget: number;
}

class OutlineService {
  // Create a new outline node
  async createOutlineNode(data: CreateOutlineNodeData): Promise<OutlineNode | null> {
    try {
      // Get the next order index for this parent/project
      const orderIndex = await this.getNextOrderIndex(data.projectId, data.parentId);

      const { data: node, error } = await supabase
        .from('outline_nodes')
        .insert({
          project_id: data.projectId,
          parent_id: data.parentId || null,
          title: data.title,
          description: data.description,
          type: data.type,
          order_index: orderIndex,
          word_count_target: data.wordCountTarget,
          word_count_current: 0,
          status: 'planned',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating outline node:', error);
        return null;
      }

      return this.mapDbNodeToOutlineNode(node);
    } catch (error) {
      console.error('Error creating outline node:', error);
      return null;
    }
  }

  // Get all outline nodes for a project
  async getOutlineNodes(projectId: string): Promise<OutlineNode[]> {
    try {
      const { data: nodes, error } = await supabase
        .from('outline_nodes')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (error) {
        console.error('Error fetching outline nodes:', error);
        return [];
      }

      // Build hierarchical structure
      return this.buildHierarchy(nodes || []);
    } catch (error) {
      console.error('Error fetching outline nodes:', error);
      return [];
    }
  }

  // Update an outline node
  async updateOutlineNode(id: string, updates: Partial<OutlineNode>): Promise<OutlineNode | null> {
    try {
      const { data: node, error } = await supabase
        .from('outline_nodes')
        .update({
          title: updates.title,
          description: updates.description,
          word_count_target: updates.wordCountTarget,
          word_count_current: updates.wordCountCurrent,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating outline node:', error);
        return null;
      }

      return this.mapDbNodeToOutlineNode(node);
    } catch (error) {
      console.error('Error updating outline node:', error);
      return null;
    }
  }

  // Delete an outline node and its children
  async deleteOutlineNode(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('outline_nodes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting outline node:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting outline node:', error);
      return false;
    }
  }

  // Reorder outline nodes
  async reorderNodes(nodeIds: string[], startIndex: number): Promise<boolean> {
    try {
      const updates = nodeIds.map((id, index) => ({
        id,
        order_index: startIndex + index,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('outline_nodes')
        .upsert(updates);

      if (error) {
        console.error('Error reordering nodes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reordering nodes:', error);
      return false;
    }
  }

  // Get the next order index for a parent
  private async getNextOrderIndex(projectId: string, parentId?: string): Promise<number> {
    try {
      const query = supabase
        .from('outline_nodes')
        .select('order_index')
        .eq('project_id', projectId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (parentId) {
        query.eq('parent_id', parentId);
      } else {
        query.is('parent_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting next order index:', error);
        return 0;
      }

      return data.length > 0 ? data[0].order_index + 1 : 0;
    } catch (error) {
      console.error('Error getting next order index:', error);
      return 0;
    }
  }

  // Map database node to OutlineNode
  private mapDbNodeToOutlineNode(dbNode: any): OutlineNode {
    return {
      id: dbNode.id,
      projectId: dbNode.project_id,
      parentId: dbNode.parent_id,
      title: dbNode.title,
      description: dbNode.description,
      type: dbNode.type,
      orderIndex: dbNode.order_index,
      wordCountTarget: dbNode.word_count_target,
      wordCountCurrent: dbNode.word_count_current,
      status: dbNode.status,
      createdAt: new Date(dbNode.created_at),
      updatedAt: new Date(dbNode.updated_at)
    };
  }

  // Build hierarchical structure from flat array
  private buildHierarchy(flatNodes: any[]): OutlineNode[] {
    const nodeMap = new Map<string, OutlineNode>();
    const rootNodes: OutlineNode[] = [];

    // First pass: create all nodes
    flatNodes.forEach(dbNode => {
      const node = this.mapDbNodeToOutlineNode(dbNode);
      node.children = [];
      nodeMap.set(node.id, node);
    });

    // Second pass: build hierarchy
    flatNodes.forEach(dbNode => {
      const node = nodeMap.get(dbNode.id);
      if (!node) return;

      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort children by order index
    const sortByOrderIndex = (nodes: OutlineNode[]) => {
      nodes.sort((a, b) => a.orderIndex - b.orderIndex);
      nodes.forEach(node => {
        if (node.children) {
          sortByOrderIndex(node.children);
        }
      });
    };

    sortByOrderIndex(rootNodes);
    return rootNodes;
  }

  // Get outline statistics
  async getOutlineStats(projectId: string): Promise<{
    totalNodes: number;
    totalWordCount: number;
    targetWordCount: number;
    completion: number;
  }> {
    try {
      const { data: nodes, error } = await supabase
        .from('outline_nodes')
        .select('word_count_current, word_count_target')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error getting outline stats:', error);
        return { totalNodes: 0, totalWordCount: 0, targetWordCount: 0, completion: 0 };
      }

      const totalNodes = nodes.length;
      const totalWordCount = nodes.reduce((sum, node) => sum + (node.word_count_current || 0), 0);
      const targetWordCount = nodes.reduce((sum, node) => sum + (node.word_count_target || 0), 0);
      const completion = targetWordCount > 0 ? Math.round((totalWordCount / targetWordCount) * 100) : 0;

      return { totalNodes, totalWordCount, targetWordCount, completion };
    } catch (error) {
      console.error('Error getting outline stats:', error);
      return { totalNodes: 0, totalWordCount: 0, targetWordCount: 0, completion: 0 };
    }
  }
}

export const outlineService = new OutlineService();
