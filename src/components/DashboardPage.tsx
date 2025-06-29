import React from 'react';
import { KanbanApp } from './KanbanApp';

interface DashboardPageProps {
  onViewChange?: (view: string) => void;
}

export function DashboardPage({ onViewChange }: DashboardPageProps) {
  return (
    <div className="h-full w-full">
      {/* Dashboard Header */}
      <div className="bg-[#f2eee2] border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your writing projects with Kanban boards</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewChange?.('canvas')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Switch to Canvas
            </button>
            <button
              onClick={() => onViewChange?.('projects')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All Projects
            </button>
            <button
              onClick={() => onViewChange?.('write')}
              className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 rounded-lg transition-colors font-medium"
            >
              Start Writing
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Integration */}
      <div className="h-[calc(100vh-120px)]">
        <KanbanApp />
      </div>
    </div>
  );
}
