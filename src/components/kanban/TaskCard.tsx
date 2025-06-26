import React from 'react';
import { Calendar, MessageSquare, Paperclip, User } from 'lucide-react';
import { Task } from '../../types/kanban';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const taskTypeStyles = {
  chapter: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Chapter'
  },
  character: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Character'
  },
  research: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'Research'
  },
  worldbuilding: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'World-building'
  },
  publishing: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Publishing'
  },
};

export function TaskCard({ task, onClick, onDragStart, onDragEnd }: TaskCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `in ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const taskStyle = taskTypeStyles[task.taskType];

  // Mock data for demonstration (in real app, this would come from task data)
  const mockComments = Math.floor(Math.random() * 5);
  const mockAttachments = Math.floor(Math.random() * 3);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Task Type Tag */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${taskStyle.bg} ${taskStyle.text}`}>
          {taskStyle.label}
        </span>
        {task.priority === 'high' && (
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>

      {/* Task Title */}
      <h4 className="font-semibold text-gray-900 mb-2 font-inter text-sm leading-tight">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {/* Left side - Due date */}
        {task.dueDate ? (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(new Date(task.dueDate))}</span>
          </div>
        ) : (
          <div></div>
        )}

        {/* Right side - Metadata and Avatar */}
        <div className="flex items-center gap-2">
          {/* Comments */}
          {mockComments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{mockComments}</span>
            </div>
          )}

          {/* Attachments */}
          {mockAttachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{mockAttachments}</span>
            </div>
          )}

          {/* Avatar placeholder (could be linked character or assignee) */}
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {task.title.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}