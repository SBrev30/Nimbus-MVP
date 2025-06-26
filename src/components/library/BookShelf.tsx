import React from 'react';
import { BookSpine } from './BookSpine';
import { Project } from '../../types/kanban';

interface BookShelfProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export function BookShelf({ projects, onSelectProject }: BookShelfProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-[#889096]">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {projects.map(project => (
          <BookSpine
            key={project.id}
            project={project}
            onClick={() => onSelectProject(project)}
          />
        ))}
      </div>
    </div>
  );
}