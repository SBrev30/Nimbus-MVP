import React, { useState, useMemo } from 'react';
import {
  X,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  AIInsight, 
  AIInsightsPanelProps, 
  InsightFilters, 
  InsightSort,
  AIInsightType,
  AIInsightSeverity 
} from '../types/ai-types';
import { AIInsightCard } from './ai-insight-card';
import { AILoadingIndicator } from './ai-loading-indicator';

const DEFAULT_FILTERS: InsightFilters = {
  types: [],
  severities: [],
  showDismissed: false,
  minConfidence: 0
};

const DEFAULT_SORT: InsightSort = {
  field: 'severity',
  direction: 'desc'
};

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  loading = false,
  onDismissInsight,
  onReanalyze,
  onFilterChange,
  onSortChange
}) => {
  const [filters, setFilters] = useState<InsightFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<InsightSort>(DEFAULT_SORT);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'suggestions'>('all');

  // Filter and sort insights
  const filteredAndSortedInsights = useMemo(() => {
    let filtered = insights.filter(insight => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(insight.type)) {
        return false;
      }
      
      // Severity filter
      if (filters.severities.length > 0 && !filters.severities.includes(insight.severity)) {
        return false;
      }
      
      // Dismissed filter
      if (!filters.showDismissed && insight.dismissed) {
        return false;
      }
      
      // Confidence filter
      if (insight.confidence < filters.minConfidence) {
        return false;
      }
      
      return true;
    });

    // Tab filtering
    switch (activeTab) {
      case 'critical':
        filtered = filtered.filter(insight => 
          insight.severity === 'critical' || insight.severity === 'high'
        );
        break;
      case 'suggestions':
        filtered = filtered.filter(insight => 
          insight.suggestions.length > 0
        );
        break;
    }

    // Sort insights
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? result : -result;
    });

    return filtered;
  }, [insights, filters, sort, activeTab]);

  const handleFilterChange = (newFilters: Partial<InsightFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleSortChange = (newSort: Partial<InsightSort>) => {
    const updatedSort = { ...sort, ...newSort };
    setSort(updatedSort);
    onSortChange?.(updatedSort);
  };

  const criticalCount = insights.filter(i => 
    (i.severity === 'critical' || i.severity === 'high') && !i.dismissed
  ).length;

  const suggestionCount = insights.filter(i => 
    i.suggestions.length > 0 && !i.dismissed
  ).length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
          {!loading && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {filteredAndSortedInsights.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50"
              title="Re-analyze content"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Issues
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
            {insights.filter(i => !i.dismissed).length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('critical')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'critical'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Critical
          {criticalCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
              {criticalCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'suggestions'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suggestions
          {suggestionCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
              {suggestionCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <div className="flex flex-wrap gap-2">
                {(['critical', 'high', 'medium', 'low'] as AIInsightSeverity[]).map(severity => (
                  <button
                    key={severity}
                    onClick={() => {
                      const newSeverities = filters.severities.includes(severity)
                        ? filters.severities.filter(s => s !== severity)
                        : [...filters.severities, severity];
                      handleFilterChange({ severities: newSeverities });
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      filters.severities.includes(severity)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            {/* Show Dismissed Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange({ showDismissed: !filters.showDismissed })}
                className={`p-2 rounded transition-colors ${
                  filters.showDismissed 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`}
              >
                {filters.showDismissed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <span className="text-sm text-gray-600">
                Show dismissed insights
              </span>
            </div>

            {/* Confidence Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Confidence: {Math.round(filters.minConfidence * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.minConfidence}
                onChange={(e) => handleFilterChange({ minConfidence: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm text-gray-600">Sort by:</span>
        <div className="flex items-center gap-2">
          <select
            value={sort.field}
            onChange={(e) => handleSortChange({ field: e.target.value as InsightSort['field'] })}
            className="text-sm border border-gray-200 rounded px-2 py-1"
          >
            <option value="severity">Severity</option>
            <option value="confidence">Confidence</option>
            <option value="createdAt">Date</option>
            <option value="type">Type</option>
          </select>
          
          <button
            onClick={() => handleSortChange({ 
              direction: sort.direction === 'asc' ? 'desc' : 'asc' 
            })}
            className="p-1 rounded hover:bg-gray-200"
            title={`Sort ${sort.direction === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sort.direction === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <AILoadingIndicator message="Analyzing content..." />
          </div>
        ) : filteredAndSortedInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {insights.length === 0 ? (
              <>
                <Zap className="w-12 h-12 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No AI Analysis Yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Run AI analysis to get insights and suggestions for your content.
                </p>
                {onReanalyze && (
                  <button
                    onClick={onReanalyze}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Analyze Content
                  </button>
                )}
              </>
            ) : (
              <>
                <CheckCircle className="w-12 h-12 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No Insights Match Filters
                </h4>
                <p className="text-gray-600">
                  Try adjusting your filters to see more insights.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredAndSortedInsights.map(insight => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                onDismiss={onDismissInsight}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
