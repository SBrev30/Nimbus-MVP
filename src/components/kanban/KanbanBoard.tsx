import React, { useState, useCallback } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskLightbox } from './TaskLightbox';
import { CreateTaskModal } from './CreateTaskModal';
import { Plus, Search, Share2, MoreHorizontal } from 'lucide-react';
import { Task, KanbanColumn as KanbanColumnType } from '../../types/kanban';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface KanbanBoardProps {
  projectId: string;
  projectTitle: string;
  onBackToLibrary: () => void;
}

export function KanbanBoard({ projectId, projectTitle, onBackToLibrary }: KanbanBoardProps) {
  const [columns, setColumns] = useLocalStorage<KanbanColumnType[]>(`kanban-${projectId}`, [
    { id: 'todo', title: 'TO DO', tasks: [] },
    { id: 'active', title: 'Active', tasks: [] },
    { id: 'in_progress', title: 'In Progress', tasks: [] },
    { id: 'completed', title: 'Completed', tasks: [] },
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'board' | 'library'>('board');

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    })));
    setSelectedTask(null);
  }, [setColumns]);

  const handleTaskDelete = useCallback((taskId: string) => {
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== taskId)
    })));
    setSelectedTask(null);
  }, [setColumns]);

  const handleCreateTask = useCallback((newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setColumns(prev => prev.map(column => 
      column.id === task.status 
        ? { ...column, tasks: [...column.tasks, task] }
        : column
    ));
    setIsCreateModalOpen(false);
  }, [setColumns]);

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDrop = useCallback((columnId: string) => {
    if (!draggedTask) return;

    setColumns(prev => {
      const newColumns = prev.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== draggedTask.id)
      }));

      return newColumns.map(column => 
        column.id === columnId 
          ? { 
              ...column, 
              tasks: [...column.tasks, { ...draggedTask, status: columnId as any }]
            }
          : column
      );
    });
    setDraggedTask(null);
  }, [draggedTask, setColumns]);

  const handleViewChange = (view: 'board' | 'library') => {
    setActiveView(view);
    if (view === 'library') {
      onBackToLibrary();
    }
  };

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col font-inter">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          {/* Top section with project title and actions */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">{projectTitle}</h1>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Add Project Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff4e00] text-gray rounded-lg hover:bg-[#ff4e00] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              
              {/* Share button */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              
              {/* More options */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom section with view toggles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewChange('board')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeView === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => handleViewChange('library')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeView === 'library'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Library
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Share2 className="w-4 h-4" />
                <span className="ml-1 text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTaskClick={handleTaskClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDraggedOver={draggedTask !== null}
            />
          ))}
        </div>
      </div>

      {/* Task Lightbox */}
      {selectedTask && (
        <TaskLightbox
          task={selectedTask}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          onCreateTask={handleCreateTask}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}