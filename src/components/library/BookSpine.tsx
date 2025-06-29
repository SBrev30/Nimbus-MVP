import React from 'react';
import { Project } from '../../types/kanban';

interface BookSpineProps {
  project: Project;
  onClick: () => void;
}

const genreColors = {
  Fantasy: 'from-purple-600 to-purple-800',
  'Sci-Fi': 'from-blue-600 to-blue-800',
  Romance: 'from-pink-600 to-pink-800',
  Mystery: 'from-gray-600 to-gray-800',
  Thriller: 'from-red-600 to-red-800',
  Historical: 'from-amber-600 to-amber-800',
  Contemporary: 'from-green-600 to-green-800',
};

export function BookSpine({ project, onClick }: BookSpineProps) {
  const gradientClass = genreColors[project.genre as keyof typeof genreColors] || 'from-gray-600 to-gray-800';
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative h-64 w-16 bg-gradient-to-b ${gradientClass} 
        rounded-t-sm rounded-b-md cursor-pointer transform transition-all duration-200 
        hover:scale-105 hover:shadow-lg group
      `}
    >
      {/* Book Spine Content */}
      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white">
        {/* Title (rotated) */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="text-xs font-semibold text-center leading-tight transform -rotate-90 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {project.title}
          </div>
        </div>

        {/* Progress indicator at bottom */}
        <div className="space-y-1">
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-center opacity-90">
            {project.completionPercentage}%
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white p-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-48">
        <h4 className="font-semibold mb-2">{project.title}</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Genre:</span>
            <span>{project.genre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Words:</span>
            <span>{formatWordCount(project.wordCount)} / {formatWordCount(project.targetWordCount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Progress:</span>
            <span>{project.completionPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Modified:</span>
            <span>{formatDate(project.lastModified)}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300">
          Click to open Kanban board
        </div>
      </div>
    </div>
  );
}