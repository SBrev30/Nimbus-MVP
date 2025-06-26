// Kanban Board Types for WritersBlock

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: 'chapter' | 'character' | 'research' | 'worldbuilding' | 'publishing';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'active' | 'in_progress' | 'completed';
  dueDate?: Date;
  linkedCharacterId?: string;
  linkedChapterId?: string;
  positionInColumn: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}