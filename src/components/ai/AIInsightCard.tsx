// src/components/ai/components/ai-insight-card.tsx

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Users,
  BookOpen,
  Target,
  MessageSquare,
  MapPin,
  Search,
  Clock
} from 'lucide-react';
import { AIInsight, AIInsightCardProps, AIInsightType, AIInsightSeverity } from '../types/ai-types';

const getInsightTypeConfig = (type: AIInsightType) => {
  switch (type) {
    case 'character_development':
      return {
        icon: Users,
        label: 'Character Development',
        color: 'blue'
      };
    case 'plot_consistency':
      return {
        icon: BookOpen,
        label: 'Plot Consistency',
        color: 'purple'
      };
    case 'conflict_suggestion':
      return {
        icon: Target,
        label: 'Conflict',
        color: 'red'
      };
    case 'character_relationship':
      return {
        icon: Users,
        label: 'Relationship',
        color: 'green'
      };
    case 'story_structure':
      return {
        icon: BookOpen,
        label: 'Story Structure',
        color: 'indigo'
      };
    case 'pacing_issue':
      return {
        icon: Clock,
        label: 'Pacing',
        color: 'orange'
      };
    case 'dialogue_improvement':
      return {
        icon: MessageSquare,
        label: 'Dialogue',
        color: 'teal'
      };
    case 'setting_detail':
      return {
        icon: MapPin,
        label: 'Setting',
        color: 'emerald'
      };
    case 'research_gap':
      return {
        icon: Search,
        label: 'Research',
        color: 'amber'
      };
    case 'continuity_error':
      return {
        icon: AlertTriangle,
        label: 'Continuity',
        color: 'red'
      };
    default:
      return {
        icon: Info,
        label: 'General',
        color: 'gray'
      };
  }
};

const getSeverityConfig = (severity: AIInsightSeverity) => {
  switch (severity) {
    case 'critical':
      return {
        icon: AlertTriangle,
        label: 'Critical',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
      };
    case 'high':
      return {
        icon: AlertTriangle,
        label: 'High',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600'
      };
    case 'medium':
      return {
        icon: Info,
        label: 'Medium',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600'
      };
    case 'low':
      return {
        icon: Info,
        label: 'Low',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
      };
    default:
      return {
        icon: Info,
        label: 'Unknown',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600'
      };
  }
};

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onDismiss,
  onApplySuggestion,
  expanded: externalExpanded,
  onToggleExpand
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  
  const typeConfig = getInsightTypeConfig(insight.type);
  const severityConfig = getSeverityConfig(insight.severity);
  const TypeIcon = typeConfig.icon;
  const SeverityIcon = severityConfig.icon;

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const confidencePercent = Math.round(insight.confidence * 100);

  if (insight.dismissed) {
    return (
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4" />
          <span>Insight dismissed: {insight.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        border rounded-lg transition-all duration-200 hover:shadow-md
        ${severityConfig.bgColor} 
        ${severityConfig.borderColor}
      `}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2 mt-0.5">
              <SeverityIcon 
                className={`w-4 h-4 ${severityConfig.iconColor}`}
              />
              <TypeIcon 
                className={`w-4 h-4 text-${typeConfig.color}-600`}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold ${severityConfig.textColor}`}>
                  {insight.title}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full bg-${typeConfig.color}-100 text-${typeConfig.color}-700`}>
                  {typeConfig.label}
                </span>
              </div>
              
              <p className={`text-sm ${severityConfig.textColor} opacity-80`}>
                {insight.description}
