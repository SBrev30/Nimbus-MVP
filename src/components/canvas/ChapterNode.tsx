import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  BookOpen, 
  Eye, 
  Users, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X 
} from 'lucide-react';
import { ChapterNodeData, ConflictData } from '../../types/masterCanvas';

interface ChapterNodeProps {
  data: ChapterNodeData;
  id: string;
  selected?: boolean;
}

export const ChapterNode: React.FC<ChapterNodeProps> = ({ data, id, selected }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'text-green-600';
      case 'revision': return 'text-yellow-600';
      case 'draft': return 'text-blue-600';
      case 'outline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const conflicts = data.conflicts || [];
  const highPriorityConflicts = conflicts.filter(c => c.severity === 'high').length;

  return (
    <>
      <div className={`relative px-4 py-3 rounded-lg border-2 min-w-[250px] ${getSeverityColor(data.significance)} ${
        selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}>
        <Handle type="target" position={Position.Top} className="w-16 !bg-gray-400" />
        
        {/* Conflict Indicators */}
        {conflicts.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {conflicts.length}
          </div>
        )}
        
        {/* Chapter Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-bold text-sm">Chapter {data.chapterNumber}</span>
          </div>
          <button
            onClick={() => setShowDetails(true)}
            className="p-1 hover:bg-white/50 rounded"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
        
        {/* Chapter Info */}
        <div className="space-y-1">
          <div className="font-medium text-sm">{data.title}</div>
          <div className="text-xs text-gray-600">{data.wordCount} words</div>
          <div className={`text-xs capitalize ${getStatusColor(data.status)}`}>
            {data.status}
          </div>
          <div className="text-xs text-gray-500">
            {data.mainCharacters.slice(0, 3).join(', ')}
            {data.mainCharacters.length > 3 && ` +${data.mainCharacters.length - 3}`}
          </div>
        </div>
        
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-gray-400" />
      </div>

      {/* Chapter Details Modal */}
      {showDetails && (
        <ChapterDetailsModal
          chapter={data}
          onClose={() => setShowDetails(false)}
          conflicts={conflicts}
        />
      )}
    </>
  );
};

interface ChapterDetailsModalProps {
  chapter: ChapterNodeData;
  conflicts: ConflictData[];
  onClose: () => void;
}

const ChapterDetailsModal: React.FC<ChapterDetailsModalProps> = ({
  chapter,
  conflicts,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chapter {chapter.chapterNumber}: {chapter.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content Tabs */}
        <div className="px-6 py-4">
          <div className="flex border-b border-gray-200 mb-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'characters', label: 'Characters' },
              { id: 'plot', label: 'Plot Events' },
              { id: 'conflicts', label: `Conflicts ${conflicts.length > 0 ? `(${conflicts.length})` : ''}` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-gray-700">{chapter.summary || 'No summary available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Word Count</h4>
                  <p className="text-gray-600">{chapter.wordCount}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Status</h4>
                  <p className="text-gray-600 capitalize">{chapter.status}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Significance</h4>
                  <p className="text-gray-600 capitalize">{chapter.significance}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Characters</h4>
                  <p className="text-gray-600">{chapter.mainCharacters.length}</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'characters' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Characters in This Chapter</h3>
              {chapter.mainCharacters.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {chapter.mainCharacters.map((character, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                      {character}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No characters identified</p>
              )}
            </div>
          )}
          
          {activeTab === 'plot' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Plot Events</h3>
              {chapter.plotEvents && chapter.plotEvents.length > 0 ? (
                <div className="space-y-2">
                  {chapter.plotEvents.map((event, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm capitalize">{event.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No plot events identified</p>
              )}
            </div>
          )}
          
          {activeTab === 'conflicts' && (
            <div className="space-y-4">
              <h3 className="font-medium mb-2">Detected Issues</h3>
              {conflicts.length > 0 ? (
                <div className="space-y-3">
                  {conflicts.map((conflict) => (
                    <ConflictCard key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-500 text-4xl mb-2">✓</div>
                  <p className="text-gray-500">No conflicts detected in this chapter</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConflictCardProps {
  conflict: ConflictData;
}

const ConflictCard: React.FC<ConflictCardProps> = ({ conflict }) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(conflict.severity)}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm capitalize">{conflict.type.replace('_', ' ')}</span>
            <span className="text-xs px-2 py-1 bg-white rounded-full capitalize">
              {conflict.severity}
            </span>
            {conflict.confidence && (
              <span className="text-xs text-gray-500">
                {Math.round(conflict.confidence * 100)}% confidence
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
          {conflict.suggestedFix && (
            <div className="text-sm">
              <span className="font-medium text-gray-600">Suggested fix: </span>
              <span className="text-gray-600">{conflict.suggestedFix}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterNode;
