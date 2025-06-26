import React from 'react';
import { CheckCircle, Clock, Layers } from 'lucide-react';

export function StatusDashboard() {
  const features = [
    {
      name: 'Rich Text Editor',
      status: 'completed',
      description: 'Full-featured editor with formatting, auto-save, and page breaks'
    },
    {
      name: 'Visual Canvas',
      status: 'completed',
      description: 'Interactive mind-mapping with drag-and-drop nodes and connections'
    },
    {
      name: 'Project Library',
      status: 'completed',
      description: 'Kanban-style project management with book shelf visualization'
    },
    {
      name: 'Notes System',
      status: 'completed',
      description: 'Categorized note-taking with real-time sync'
    },
    {
      name: 'Theme System',
      status: 'completed',
      description: 'Light/dark mode with system preference detection'
    },
    {
      name: 'Responsive Design',
      status: 'completed',
      description: 'Optimized for different screen sizes and zoom levels'
    },
    {
      name: 'AI Integration',
      status: 'planned',
      description: 'Story development assistance and plot hole detection'
    },
    {
      name: 'Collaboration',
      status: 'planned',
      description: 'Real-time sharing with beta readers and editors'
    },
    {
      name: 'Import/Export',
      status: 'planned',
      description: 'Integration with Notion, Google Docs, and Word'
    }
  ];

  const completedCount = features.filter(f => f.status === 'completed').length;
  const totalCount = features.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">WritersBlock Development Status</h1>
          <p className="text-blue-100">Comprehensive writing platform for visual storytellers</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{completedCount}/{totalCount} features completed</span>
            </div>
            <div className="w-full bg-blue-400 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="p-6">
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mt-1">
                  {feature.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : feature.status === 'in-progress' ? (
                    <Layers className="w-6 h-6 text-blue-500" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : feature.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature.status === 'completed' ? 'Completed' : 
                       feature.status === 'in-progress' ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Features Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Major Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}