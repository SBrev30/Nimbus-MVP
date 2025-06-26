import React from 'react'
import { AIInsight } from '../services/aiAnalysisService'

interface AIStatusBadgeProps {
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  insightCount?: number
  criticalIssues?: number
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  onClick?: () => void
}

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({
  status,
  insightCount = 0,
  criticalIssues = 0,
  size = 'md',
  showText = false,
  className = '',
  onClick
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          text: 'Analysis Pending',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-300',
          pulseColor: ''
        }
      case 'analyzing':
        return {
          icon: '🔄',
          text: 'Analyzing...',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-300',
          pulseColor: 'animate-pulse'
        }
      case 'complete':
        return {
          icon: '✅',
          text: criticalIssues > 0 ? `${criticalIssues} Critical Issues` : 'Analysis Complete',
          bgColor: criticalIssues > 0 ? 'bg-red-100' : 'bg-green-100',
          textColor: criticalIssues > 0 ? 'text-red-600' : 'text-green-600',
          borderColor: criticalIssues > 0 ? 'border-red-300' : 'border-green-300',
          pulseColor: ''
        }
      case 'error':
        return {
          icon: '❌',
          text: 'Analysis Failed',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          borderColor: 'border-red-300',
          pulseColor: ''
        }
      default:
        return {
          icon: '❓',
          text: 'Unknown Status',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-300',
          pulseColor: ''
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-1.5 py-0.5 text-xs',
          icon: 'text-xs',
          spacing: 'gap-1'
        }
      case 'md':
        return {
          container: 'px-2 py-1 text-sm',
          icon: 'text-sm',
          spacing: 'gap-1.5'
        }
      case 'lg':
        return {
          container: 'px-3 py-1.5 text-base',
          icon: 'text-base',
          spacing: 'gap-2'
        }
    }
  }

  const config = getStatusConfig()
  const sizeClasses = getSizeClasses()

  const badgeContent = (
    <div
      className={`
        inline-flex items-center rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses.container} ${sizeClasses.spacing}
        ${config.pulseColor}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <span className={`${sizeClasses.icon} ${config.pulseColor}`}>
        {config.icon}
      </span>
      
      {showText && (
        <span className="font-medium">
          {config.text}
        </span>
      )}
      
      {status === 'complete' && insightCount > 0 && !showText && (
        <span className="font-medium">
          {insightCount}
        </span>
      )}
    </div>
  )

  return badgeContent
}

// Mini insight count badge for showing just numbers
export const InsightCountBadge: React.FC<{
  count: number
  severity?: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md'
  className?: string
  onClick?: () => void
}> = ({
  count,
  severity = 'medium',
  size = 'sm',
  className = '',
  onClick
}) => {
  if (count === 0) return null

  const severityStyles = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white'
  }

  const sizeStyles = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm'
  }

  return (
    <div
      className={`
        absolute -top-1 -right-1 rounded-full flex items-center justify-center
        font-bold z-10
        ${severityStyles[severity]}
        ${sizeStyles[size]}
        ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {count > 99 ? '99+' : count}
    </div>
  )
}

// Status indicator for different AI analysis states
export const AIAnalysisIndicator: React.FC<{
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  progress?: number
  className?: string
}> = ({
  status,
  progress = 0,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AIStatusBadge 
        status={status} 
        size="sm"
      />
      
      {status === 'analyzing' && (
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Compact status overview for multiple items
export const AIStatusSummary: React.FC<{
  stats: {
    total: number
    analyzed: number
    pending: number
    analyzing: number
    errors: number
    criticalIssues: number
  }
  className?: string
  onStatusClick?: (status: string) => void
}> = ({
  stats,
  className = '',
  onStatusClick
}) => {
  const getCompletionPercentage = () => {
    if (stats.total === 0) return 0
    return Math.round((stats.analyzed / stats.total) * 100)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">AI Analysis Status</h4>
        <span className="text-xs text-gray-500">
          {getCompletionPercentage()}% Complete
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div 
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => onStatusClick?.('complete')}
        >
          <AIStatusBadge status="complete" size="sm" />
          <span>{stats.analyzed}</span>
        </div>
        
        <div 
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded p-1"
          onClick={() => onStatusClick?.('pending')}
        >
          <AIStatusBadge status="pending" size="sm" />
          <span>{stats.pending}</span>
        </div>
        
        {stats.analyzing > 0 && (
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded p-1"
            onClick={() => onStatusClick?.('analyzing')}
          >
            <AIStatusBadge status="analyzing" size="sm" />
            <span>{stats.analyzing}</span>
          </div>
        )}
        
        {stats.errors > 0 && (
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded p-1"
            onClick={() => onStatusClick?.('error')}
          >
            <AIStatusBadge status="error" size="sm" />
            <span>{stats.errors}</span>
          </div>
        )}
      </div>
      
      {stats.criticalIssues > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-red-600">
            <span className="text-xs font-medium">
              ⚠️ {stats.criticalIssues} Critical Issues Found
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
