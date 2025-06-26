import React, { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, Users, Zap, AlertTriangle, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { AIAnalysisResult, StoryCoherenceResult, RelationshipSuggestion, CharacterArcAnalysis } from '../../services/intelligentAIService';

interface AIAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  results: AIAnalysisResult[];
  isAnalyzing: boolean;
  onApplySuggestion: (suggestionId: string, data: any) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  isOpen,
  onClose,
  results,
  isAnalyzing,
  onApplySuggestion
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (results.length > 0 && activeTab === 'overview') {
      // Auto-switch to first available analysis type
      setActiveTab(results[0].type);
    }
  }, [results]);

  if (!isOpen) return null;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSuccessfulResults = () => results.filter(r => r.success);
  const getTabIcon = (type: string) => {
    switch (type) {
      case 'character': return <Users size={16} />;
      case 'story-coherence': return <TrendingUp size={16} />;
      case 'relationships': return <Users size={16} />;
      case 'character-arcs': return <Zap size={16} />;
      default: return <Brain size={16} />;
    }
  };

  const renderOverview = () => {
    const successfulResults = getSuccessfulResults();
    const totalRecommendations = successfulResults.reduce((acc, r) => acc + (r.recommendations?.length || 0), 0);
    const avgConfidence = successfulResults.length > 0 
      ? Math.round(successfulResults.reduce((acc, r) => acc + r.confidence, 0) / successfulResults.length * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{successfulResults.length}</div>
            <div className="text-sm text-blue-600">Analyses Complete</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{avgConfidence}%</div>
            <div className="text-sm text-green-600">Avg Confidence</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{totalRecommendations}</div>
            <div className="text-sm text-purple-600">Recommendations</div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Quick Insights
          </h3>
          
          {successfulResults.map((result, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTabIcon(result.type)}
                  <span className="font-medium capitalize">{result.type.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.confidence > 0.7 ? 'bg-green-500' : result.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-500">{Math.round(result.confidence * 100)}% confidence</span>
                </div>
              </div>
              
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="space-y-1">
                  {result.recommendations.slice(0, 2).map((rec, recIndex) => (
                    <div key={recIndex} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCharacterAnalysis = () => {
    const characterResults = results.filter(r => r.type === 'character' && r.success);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Character Analysis</h3>
        
        {characterResults.map((result, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Character Analysis #{index + 1}</h4>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">{Math.round(result.confidence * 100)}% confidence</span>
              </div>
            </div>
            
            {result.data.fantasyClass && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Suggested Class</div>
                <div className="text-purple-600">{result.data.fantasyClass}</div>
              </div>
            )}
            
            {result.data.suggestions && result.data.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Suggestions:</div>
                {result.data.suggestions.map((suggestion: string, suggestionIndex: number) => (
                  <div key={suggestionIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Recommendations:</div>
                {result.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStoryCoherence = () => {
    const coherenceResult = results.find(r => r.type === 'story-coherence' && r.success);
    
    if (!coherenceResult) {
      return (
        <div className="text-center py-8 text-gray-500">
          No story coherence analysis available
        </div>
      );
    }

    const data = coherenceResult.data as StoryCoherenceResult;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{data.overallScore}/100</div>
          <div className="text-sm text-gray-600">Overall Story Coherence Score</div>
        </div>

        {/* Issues */}
        {data.issues && data.issues.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Identified Issues ({data.issues.length})
            </h4>
            
            {data.issues.map((issue, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                issue.severity === 'moderate' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{issue.type.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    issue.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    issue.severity === 'moderate' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                <div className="text-sm text-gray-600">
                  <strong>Fix:</strong> {issue.suggestedFix}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plot Holes */}
        {data.plotHoles && data.plotHoles.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Plot Holes ({data.plotHoles.length})
            </h4>
            
            {data.plotHoles.map((hole, index) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{hole.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    hole.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    hole.severity === 'moderate' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {hole.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{hole.description}</p>
                <div className="text-sm text-gray-600">
                  <strong>Resolution:</strong> {hole.suggestedResolution}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-500" />
              Improvement Suggestions
            </h4>
            
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRelationships = () => {
    const relationshipResult = results.find(r => r.type === 'relationships' && r.success);
    
    if (!relationshipResult || !relationshipResult.data.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          No relationship suggestions available
        </div>
      );
    }

    const suggestions = relationshipResult.data as RelationshipSuggestion[];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Relationship Suggestions</h3>
        
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium capitalize">{suggestion.relationshipType}</h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${suggestion.confidence > 0.7 ? 'bg-green-500' : suggestion.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500">{Math.round(suggestion.confidence * 100)}% confidence</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Strength:</strong> {suggestion.strength}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${suggestion.strength * 10}%` }}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{suggestion.reasoning}</p>
            
            <button
              onClick={() => onApplySuggestion(`relationship-${index}`, suggestion)}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              Apply Relationship
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderCharacterArcs = () => {
    const arcResult = results.find(r => r.type === 'character-arcs' && r.success);
    
    if (!arcResult || !arcResult.data.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          No character arc analysis available
        </div>
      );
    }

    const analyses = arcResult.data as CharacterArcAnalysis[];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Character Arc Analysis</h3>
        
        {analyses.map((analysis, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Character #{index + 1}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Growth Score:</span>
                <span className="text-lg font-bold text-green-600">{analysis.growth}/10</span>
              </div>
            </div>
            
            {/* Development Aspects */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Development Areas:</h5>
              {analysis.development.map((dev, devIndex) => (
                <div key={devIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm capitalize">{dev.aspect}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${dev.change > 0 ? 'text-green-600' : dev.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {dev.change > 0 ? '+' : ''}{dev.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Conflicts */}
            {analysis.conflicts.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Identified Conflicts:</h5>
                {analysis.conflicts.map((conflict, conflictIndex) => (
                  <div key={conflictIndex} className="text-sm text-gray-600 mb-1 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    {conflict}
                  </div>
                ))}
              </div>
            )}
            
            {/* Stages */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Story Stages:</h5>
              <div className="space-y-2">
                {analysis.stages.map((stage, stageIndex) => (
                  <div key={stageIndex} className="flex items-center justify-between py-1">
                    <span className="text-sm capitalize">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stage.growth * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{stage.growth}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Brain size={16} /> },
    { id: 'character', label: 'Characters', icon: <Users size={16} /> },
    { id: 'story-coherence', label: 'Story', icon: <TrendingUp size={16} /> },
    { id: 'relationships', label: 'Relationships', icon: <Users size={16} /> },
    { id: 'character-arcs', label: 'Character Arcs', icon: <Zap size={16} /> },
  ];

  const availableTabs = tabs.filter(tab => 
    tab.id === 'overview' || results.some(r => r.type === tab.id && r.success)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">AI Story Analysis</h2>
            {isAnalyzing && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-600">Analyzing...</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200">
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Analyzing your story elements...</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No analysis results available</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'character' && renderCharacterAnalysis()}
              {activeTab === 'story-coherence' && renderStoryCoherence()}
              {activeTab === 'relationships' && renderRelationships()}
              {activeTab === 'character-arcs' && renderCharacterArcs()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {results.filter(r => r.success).length} of {results.length} analyses completed
            </div>
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <div className="text-sm text-gray-500">
                  Processing time: {Math.max(...results.map(r => r.processingTime))}ms
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
