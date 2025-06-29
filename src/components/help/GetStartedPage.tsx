import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  CheckCircle,
  PenTool,
  Palette,
  Bot,
  FolderKanban,
  Lightbulb
} from 'lucide-react';
import { HelpLayout } from './HelpLayout';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  content: React.ReactNode;
  tips?: string[];
}

interface GetStartedPageProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

export function GetStartedPage({ activeView, onNavigate }: GetStartedPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Nimbus Note',
      description: 'Your creative writing platform with AI assistance',
      duration: '30 seconds',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#ff4e00] to-[#ff9602]/200 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-3 font-inter">Welcome to Nimbus Note!</h3>
            <p className="text-gray-800 font-inter leading-relaxed">
              Nimbus Note is a visual writing platform that combines traditional writing tools with infinite canvas brainstorming and AI assistance. Whether you're writing a novel, screenplay, or game narrative, we've got you covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#C6C5C5] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-5 h-5 text-[#ff4e00]" />
                <h4 className="font-semibold text-gray-900 font-inter">Focused Writing</h4>
              </div>
              <p className="text-sm text-[#889096] font-inter">Distraction-free writing environment with auto-save</p>
            </div>
            <div className="p-4 border border-[#C6C5C5] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-[#ff4e00]" />
                <h4 className="font-semibold text-gray-900 font-inter">Visual Canvas</h4>
              </div>
              <p className="text-sm text-[#889096] font-inter">Infinite canvas for story mapping and brainstorming</p>
            </div>
            <div className="p-4 border border-[#C6C5C5] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-5 h-5 text-[#ff4e00]" />
                <h4 className="font-semibold text-gray-900 font-inter">AI Assistance</h4>
              </div>
              <p className="text-sm text-[#889096] font-inter">Context-aware AI to help develop characters and plots</p>
            </div>
            <div className="p-4 border border-[#C6C5C5] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="w-5 h-5 text-[#ff4e00]" />
                <h4 className="font-semibold text-gray-900 font-inter">Project Management</h4>
              </div>
              <p className="text-sm text-[#889096] font-inter">Kanban boards and library views for organization</p>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Take your time to explore each feature',
        'You can always come back to this guide from the Help menu',
        'Your progress is automatically saved'
      ]
    },
    {
      id: 'navigation',
      title: 'Dashboard & Navigation',
      description: 'Understanding the main interface and sidebar',
      duration: '1 minute',
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 font-inter">Navigation Overview</h4>
            <p className="text-blue-800 font-inter">
              The sidebar on the left contains all your main navigation. You can collapse it for more writing space or expand it for full access to features.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border border-[#C6C5C5] rounded-lg">
              <div className="w-8 h-8 bg-[#ff4e00] rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">W</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 font-inter">Write Section</h5>
                <p className="text-sm text-[#889096] font-inter">Access your projects, create new chapters, and use the focused writing editor</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 border border-[#C6C5C5] rounded-lg">
              <div className="w-8 h-8 bg-[#ff4e00] rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">C</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 font-inter">Canvas</h5>
                <p className="text-sm text-[#889096] font-inter">Visual brainstorming space with infinite canvas and AI nodes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 border border-[#C6C5C5] rounded-lg">
              <div className="w-8 h-8 bg-[#ff4e00] rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">P</span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 font-inter">Planning</h5>
                <p className="text-sm text-[#889096] font-inter">Character creation, plot development, and world-building tools</p>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        'Click the toggle button to collapse/expand the sidebar',
        'Breadcrumb navigation shows your current location',
        'Each section has subsections accessible via dropdown'
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      markStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  };

  const resetTour = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  const startAutoplay = () => {
    setIsPlaying(true);
    // Auto-advance through steps (simplified - would need proper timing)
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <HelpLayout
      activeView={activeView}
      onNavigate={onNavigate}
      title="Get Started"
      description="Interactive walkthrough of Nimbus Note features"
      showBackButton
      showBreadcrumb={false}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#889096] font-inter">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
          <span className="text-sm text-[#889096] font-inter">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#ff4e00] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tour Controls */}
      <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2">
          <button
            onClick={startAutoplay}
            className="inline-flex items-center gap-2 text-sm text-[#889096] hover:text-gray-700 transition-colors font-inter"
          >
            <Play className="w-4 h-4" />
            Auto-play
          </button>
          <button
            onClick={resetTour}
            className="inline-flex items-center gap-2 text-sm text-[#889096] hover:text-gray-700 transition-colors font-inter"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
        
        <div className="text-sm text-[#889096] font-inter">
          Duration: {currentStepData.duration}
        </div>
      </div>

      {/* Step Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {onboardingSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => goToStep(index)}
            className={`px-3 py-1 text-xs rounded-full transition-colors font-inter ${
              index === currentStep
                ? 'bg-[#ff4e00] text-gray-900'
                : completedSteps.has(index)
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-[#889096] hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              {completedSteps.has(index) && (
                <CheckCircle className="w-3 h-3" />
              )}
              <span>{index + 1}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="bg-white border border-[#C6C5C5] rounded-lg p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-inter">
            {currentStepData.title}
          </h2>
          <p className="text-[#889096] font-inter">
            {currentStepData.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStepData.content}
        </div>

        {/* Tips Section */}
        {currentStepData.tips && currentStepData.tips.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900 font-inter">Tips</h4>
            </div>
            <ul className="space-y-1">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="text-sm text-blue-800 font-inter">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-inter ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#889096] font-inter">
            {currentStep + 1} / {onboardingSteps.length}
          </span>
        </div>

        {currentStep === onboardingSteps.length - 1 ? (
          <button
            onClick={() => {
              markStepComplete(currentStep);
              onNavigate?.('projects');
            }}
            className="inline-flex items-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 px-4 py-2 rounded-lg transition-colors font-inter font-medium"
          >
            Start Writing
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 px-4 py-2 rounded-lg transition-colors font-inter font-medium"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </HelpLayout>
  );
}
