import React from 'react';
import { Brain, Loader2, Zap, Sparkles } from 'lucide-react';

interface AILoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  progress?: number;
  className?: string;
}

export function AILoadingIndicator({
  message = "AI is analyzing...",
  size = 'md',
  variant = 'default',
  progress,
  className = ''
}: AILoadingIndicatorProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          icon: 'w-4 h-4',
          text: 'text-xs',
          sparkle: 'w-2 h-2'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'w-8 h-8',
          text: 'text-lg',
          sparkle: 'w-4 h-4'
        };
      default: // md
        return {
          container: 'p-4',
          icon: 'w-6 h-6',
          text: 'text-sm',
          sparkle: 'w-3 h-3'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`${sizeClasses.icon} animate-spin text-blue-600`} />
        <span className={`${sizeClasses.text} text-gray-600`}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 ${sizeClasses.container} ${className}`}>
        <div className="flex flex-col items-center text-center">
          {/* Animated AI Icon */}
          <div className="relative mb-4">
            <Brain className={`${sizeClasses.icon} text-blue-600 animate-pulse`} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className={`${sizeClasses.sparkle} text-purple-500 animate-bounce`} />
            </div>
          </div>

          {/* Message */}
          <p className={`${sizeClasses.text} font-medium text-gray-800 mb-2`}>
            {message}
          </p>

          {/* Progress Bar (if provided) */}
          {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}

          {/* Animated Dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>

          {/* Progress Text */}
          {progress !== undefined && (
            <p className="text-xs text-gray-600 mt-2">
              {Math.round(progress)}% complete
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-3 ${sizeClasses.container} ${className}`}>
      {/* Spinning Brain Icon */}
      <div className="relative">
        <Brain className={`${sizeClasses.icon} text-blue-600 animate-pulse`} />
        <Loader2 className={`${sizeClasses.icon} absolute inset-0 text-blue-400 animate-spin`} />
      </div>

      <div className="flex-1">
        <p className={`${sizeClasses.text} font-medium text-gray-800`}>
          {message}
        </p>
        
        {progress !== undefined && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized loading indicators for specific AI operations
export function CharacterAnalysisLoader({ className = '' }: { className?: string }) {
  return (
    <AILoadingIndicator
      message="Analyzing character development..."
      variant="detailed"
      className={className}
    />
  );
}

export function PlotAnalysisLoader({ className = '' }: { className?: string }) {
  return (
    <AILoadingIndicator
      message="Checking plot consistency..."
      variant="detailed"
      className={className}
    />
  );
}

export function ContentAnalysisLoader({ 
  progress, 
  className = '' 
}: { 
  progress?: number; 
  className?: string; 
}) {
  return (
    <AILoadingIndicator
      message="Processing content with AI..."
      variant="detailed"
      progress={progress}
      className={className}
    />
  );
}

// Inline loader for buttons and small spaces
export function InlineAILoader({ 
  message = "Analyzing...", 
  className = '' 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <AILoadingIndicator
      message={message}
      size="sm"
      variant="minimal"
      className={className}
    />
  );
}

// Floating overlay loader
export function AIAnalysisOverlay({ 
  isVisible, 
  message = "AI is analyzing your content...",
  progress,
  onCancel
}: {
  isVisible: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <AILoadingIndicator
            message={message}
            variant="detailed"
            progress={progress}
            size="lg"
          />
          
          {onCancel && (
            <div className="mt-4 text-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
