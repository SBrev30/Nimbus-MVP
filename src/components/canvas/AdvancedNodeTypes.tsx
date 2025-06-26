import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  MapPin, 
  Building, 
  Mountain, 
  Castle, 
  Trees, 
  Users, 
  Crown, 
  Heart,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Flame,
  Shield,
  Sword,
  FileText
} from 'lucide-react';

// Location Node Component
export const LocationNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city': return <Building className="w-4 h-4" />;
      case 'kingdom': return <Crown className="w-4 h-4" />;
      case 'village': return <Users className="w-4 h-4" />;
      case 'castle': return <Castle className="w-4 h-4" />;
      case 'forest': return <Trees className="w-4 h-4" />;
      case 'mountain': return <Mountain className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'major': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'moderate': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'minor': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] max-w-[300px] ${
      selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''
    } ${getImportanceColor(data.importance)}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getLocationIcon(data.type)}
          <span className="text-xs font-medium capitalize">{data.type}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/50 rounded"
        >
          {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <h3 className="font-bold text-sm mb-1">{data.name}</h3>
      
      <div className="space-y-2">
        <textarea
          value={data.description}
          placeholder="Location description, atmosphere, significance..."
          rows={2}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
          readOnly
        />

        {isExpanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
            {data.geography && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Geography</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Climate: {data.geography.climate}</p>
                  <p>Terrain: {data.geography.terrain}</p>
                  <p>Size: {data.geography.size}</p>
                </div>
              </div>
            )}

            {data.culture && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Culture</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Politics: {data.culture.politics}</p>
                  <p>Religion: {data.culture.religion}</p>
                  <p>Customs: {data.culture.customs}</p>
                </div>
              </div>
            )}

            {data.connectedCharacters && data.connectedCharacters.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Connected Characters</h4>
                <div className="flex flex-wrap gap-1">
                  {data.connectedCharacters.map((char: string, idx: number) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// Theme Node Component
export const ThemeNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThemeIcon = (type: string) => {
    switch (type) {
      case 'central': return <Heart className="w-4 h-4" />;
      case 'supporting': return <Lightbulb className="w-4 h-4" />;
      case 'minor': return <BookOpen className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getThemeColor = (significance: string) => {
    switch (significance) {
      case 'major': return 'bg-pink-100 border-pink-300 text-pink-800';
      case 'moderate': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'minor': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-pink-100 border-pink-300 text-pink-800';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] max-w-[300px] ${
      selected ? 'ring-2 ring-pink-400 ring-offset-2' : ''
    } ${getThemeColor(data.significance)}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getThemeIcon(data.type)}
          <span className="text-xs font-medium capitalize">{data.type} Theme</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/50 rounded"
        >
          {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <h3 className="font-bold text-sm mb-1">{data.title}</h3>
      
      <div className="space-y-2">
        <textarea
          value={data.description}
          placeholder="Theme description and how it manifests..."
          rows={2}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
          readOnly
        />

        {isExpanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Development</h4>
              <p className="text-xs text-gray-600">{data.development}</p>
            </div>

            {data.examples && data.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Examples</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {data.examples.map((example: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-gray-400">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.symbolism && data.symbolism.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Symbolism</h4>
                <div className="flex flex-wrap gap-1">
                  {data.symbolism.map((symbol: string, idx: number) => (
                    <span key={idx} className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// Conflict Node Component
export const ConflictNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'internal': return <Heart className="w-4 h-4" />;
      case 'external': return <Sword className="w-4 h-4" />;
      case 'interpersonal': return <Users className="w-4 h-4" />;
      case 'societal': return <Crown className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'low': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] max-w-[300px] ${
      selected ? 'ring-2 ring-red-400 ring-offset-2' : ''
    } ${getIntensityColor(data.intensity)}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getConflictIcon(data.type)}
          <span className="text-xs font-medium capitalize">{data.type}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/50 rounded"
        >
          {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <h3 className="font-bold text-sm mb-1">{data.title}</h3>
      
      <div className="space-y-2">
        <textarea
          value={data.description}
          placeholder="Conflict description, nature, and impact..."
          rows={2}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
          readOnly
        />

        {isExpanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
            {data.participants && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Participants</h4>
                <div className="flex flex-wrap gap-1">
                  {data.participants.map((participant: string, idx: number) => (
                    <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">Stakes</h4>
              <p className="text-xs text-gray-600">{data.stakes}</p>
            </div>

            {data.resolution && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Resolution</h4>
                <p className="text-xs text-gray-600">{data.resolution}</p>
              </div>
            )}

            {data.relatedPlots && data.relatedPlots.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Related Plots</h4>
                <div className="flex flex-wrap gap-1">
                  {data.relatedPlots.map((plot: string, idx: number) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {plot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

// Timeline Node Component
export const TimelineNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'backstory': return <Clock className="w-4 h-4" />;
      case 'current': return <Zap className="w-4 h-4" />;
      case 'future': return <Target className="w-4 h-4" />;
      case 'flashback': return <BookOpen className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'major': return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'moderate': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'minor': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] max-w-[300px] ${
      selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
    } ${getSignificanceColor(data.significance)}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{getTimelineIcon(data.type)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900">{data.title || 'Timeline Event'}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="capitalize">{data.type}</span>
            <span>•</span>
            <span>Order: {data.order}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-700">Timeframe: </span>
          <span className="text-xs text-gray-600">{data.timeframe}</span>
        </div>

        {data.duration && (
          <div>
            <span className="text-xs font-medium text-gray-700">Duration: </span>
            <span className="text-xs text-gray-600">{data.duration}</span>
          </div>
        )}

        <textarea
          value={data.description}
          placeholder="Event description, consequences, timing..."
          rows={2}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
          readOnly
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 capitalize">Significance: {data.significance}</span>
          {data.connectedEvents && data.connectedEvents.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {data.connectedEvents.length} connected
            </span>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

// Research Node Component (Enhanced)
export const ResearchNode = ({ data, id, selected }: { data: any; id: string; selected?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'worldbuilding': return 'bg-green-100 border-green-300 text-green-800';
      case 'character': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'plot': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'lore': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[220px] max-w-[300px] ${
      selected ? 'ring-2 ring-green-400 ring-offset-2' : ''
    } ${getCategoryColor(data.category || 'worldbuilding')}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-medium capitalize">{data.category || 'Research'}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/50 rounded"
        >
          {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <h3 className="font-bold text-sm mb-1">{data.title}</h3>
      
      <div className="space-y-2">
        <textarea
          value={data.content}
          placeholder="Research content and findings..."
          rows={2}
          className="w-full text-xs bg-transparent border-none outline-none resize-none placeholder-gray-400"
          readOnly
        />

        {isExpanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
            {data.source && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Source</h4>
                <p className="text-xs text-gray-600">{data.source}</p>
              </div>
            )}

            {data.tags && data.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {data.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.importance && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Importance:</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  data.importance === 'critical' ? 'bg-red-100 text-red-800' :
                  data.importance === 'important' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {data.importance}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// Export all node types for the main Canvas component
export const advancedNodeTypes = {
  location: LocationNode,
  theme: ThemeNode,
  conflict: ConflictNode,
  timeline: TimelineNode,
  research: ResearchNode,
};
