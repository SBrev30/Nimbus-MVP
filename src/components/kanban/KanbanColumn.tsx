import React from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { KanbanColumn as KanbanColumnType, Task } from '../../types/kanban';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onTaskClick: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: (columnId: string) => void;
  isDraggedOver: boolean;
}

export function KanbanColumn({ 
  column, 
  onTaskClick, 
  onDragStart, 
  onDragEnd, 
  onDrop,
  isDraggedOver 
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(column.id);
  };

  return (
    <div className="flex flex-col w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide font-inter">
            {column.title}
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {column.tasks.length}
          </span>
        </div>
        
        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Container */}
      <div 
        className={`space-y-3 min-h-[500px] transition-colors rounded-lg ${
          isDraggedOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {column.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={() => onDragStart(task)}
            onDragEnd={onDragEnd}
          />
        ))}
        
        {column.tasks.length === 0 && !isDraggedOver && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}