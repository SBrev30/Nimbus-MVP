import React, { useState, useEffect } from 'react';
import { BookShelf } from './BookShelf';
import { LibraryHeader } from './LibraryHeader';
import { projectService, Project } from '../../services/projectService';

interface LibraryViewProps {
  onSelectProject: (project: Project) => void;
}

export function LibraryView({ onSelectProject }: LibraryViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'lastModified' | 'completion'>('lastModified');
  const [filterGenre, setFilterGenre] = useState<string>('all');

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const projectsData = await projectService.getUserProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const genres = ['all', ...Array.from(new Set(projects.map(p => p.genre)))];

  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || project.genre === filterGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'lastModified':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'completion':
          const aCompletion = a.wordCountTarget > 0 ? (a.wordCountCurrent / a.wordCountTarget) * 100 : 0;
          const bCompletion = b.wordCountTarget > 0 ? (b.wordCountCurrent / b.wordCountTarget) * 100 : 0;
          return bCompletion - aCompletion;
        default:
          return 0;
      }
    });

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col font-inter">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#A5F7AC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#889096]">Loading your projects...</p>
          </div>
        </div>
      ) : (
        <>
          <LibraryHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterGenre={filterGenre}
            onFilterChange={setFilterGenre}
            genres={genres}
            projectCount={filteredAndSortedProjects.length}
          />
          
          <div className="flex-1 overflow-y-auto">
            <BookShelf
              projects={filteredAndSortedProjects.map(project => ({
                id: project.id,
                title: project.title,
                genre: project.genre || 'Unknown',
                wordCount: project.wordCountCurrent,
                targetWordCount: project.wordCountTarget,
                completionPercentage: project.wordCountTarget > 0 
                  ? Math.round((project.wordCountCurrent / project.wordCountTarget) * 100) 
                  : 0,
                lastModified: new Date(project.updatedAt),
                createdAt: new Date(project.createdAt)
              }))}
              onSelectProject={onSelectProject}
            />
          </div>
        </>
      )}
    </div>
  );
}