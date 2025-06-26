import React, { useState } from 'react';
import { LibraryView } from './library/LibraryView';
import { KanbanBoard } from './kanban/KanbanBoard';
import { Project } from '../types/kanban';

export function KanbanApp() {
  const [currentView, setCurrentView] = useState<'library' | 'kanban'>('library');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('kanban');
  };

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setSelectedProject(null);
  };

  if (currentView === 'kanban' && selectedProject) {
    return (
      <KanbanBoard
        projectId={selectedProject.id}
        projectTitle={selectedProject.title}
        onBackToLibrary={handleBackToLibrary}
      />
    );
  }

  return <LibraryView onSelectProject={handleSelectProject} />;
}