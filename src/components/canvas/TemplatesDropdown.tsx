// src/components/canvas/TemplatesDropdown.tsx
import React, { useState, useCallback } from 'react';
import { useCanvasPlanningData } from '../../hooks/useCanvasPlanningData';
import { generateSampleStory, generateFantasyAdventure, generateMysteryStory } from './SampleStoryTemplates';

interface TemplatesDropdownProps {
  onTemplateSelect: (template: any) => void;
  projectId?: string;
}

export const TemplatesDropdown: React.FC<TemplatesDropdownProps> = ({ 
  onTemplateSelect, 
  projectId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { planningCharacters, plotThreads, loading } = useCanvasPlanningData(projectId);

  const generateThreeActStructure = useCallback(() => {
    const nodes = [];
    const edges = [];
    
    // Act 1 - Setup
    nodes.push({
      id: 'act1-setup',
      type: 'plot',
      position: { x: 100, y: 100 },
      data: {
        name: 'Act 1: Setup',
        type: 'plot',
        description: 'Introduce characters and establish the world',
        fromTemplate: true
      }
    });

    // Act 2 - Confrontation  
    nodes.push({
      id: 'act2-confrontation',
      type: 'plot',
      position: { x: 400, y: 100 },
      data: {
        name: 'Act 2: Confrontation',
        type: 'plot', 
        description: 'Rising action, obstacles, and conflict',
        fromTemplate: true
      }
    });

    // Act 3 - Resolution
    nodes.push({
      id: 'act3-resolution',
      type: 'plot',
      position: { x: 700, y: 100 },
      data: {
        name: 'Act 3: Resolution',
        type: 'plot',
        description: 'Climax, falling action, and resolution',
        fromTemplate: true
      }
    });

    // Add main characters from planning data
    planningCharacters.slice(0, 3).forEach((char, index) => {
      nodes.push({
        id: `template-char-${char.planningId}`,
        type: 'character',
        position: { x: 200 + (index * 200), y: 300 },
        data: {
          ...char,
          fromTemplate: true
        }
      });
    });

    // Connect acts in sequence
    edges.push(
      { 
        id: 'act1-act2', 
        source: 'act1-setup', 
        target: 'act2-confrontation',
        animated: true
      },
      { 
        id: 'act2-act3', 
        source: 'act2-confrontation', 
        target: 'act3-resolution',
        animated: true
      }
    );

    return { nodes, edges };
  }, [planningCharacters]);

  const generateHeroJourney = useCallback(() => {
    const heroJourneySteps = [
      { name: 'Ordinary World', desc: 'Hero\'s normal life before transformation' },
      { name: 'Call to Adventure', desc: 'Hero faces a problem or challenge' },
      { name: 'Crossing Threshold', desc: 'Hero commits to the adventure' },
      { name: 'Tests & Allies', desc: 'Hero faces challenges and makes allies' },
      { name: 'The Ordeal', desc: 'Hero faces their greatest fear' },
      { name: 'The Reward', desc: 'Hero survives and gains something' },
      { name: 'The Return', desc: 'Hero returns to ordinary world transformed' }
    ];

    const nodes = heroJourneySteps.map((step, index) => ({
      id: `hero-${index}`,
      type: 'plot',
      position: { x: 100 + (index * 150), y: 100 },
      data: {
        name: step.name,
        type: 'plot',
        description: step.desc,
        fromTemplate: true
      }
    }));

    // Add hero character from planning data
    if (planningCharacters.length > 0) {
      const hero = planningCharacters[0];
      nodes.push({
        id: 'hero-character',
        type: 'character',
        position: { x: 500, y: 300 },
        data: {
          ...hero,
          name: `${hero.name} (Hero)`,
          fromTemplate: true
        }
      });
    }

    // Connect journey steps
    const edges = heroJourneySteps.slice(0, -1).map((_, index) => ({
      id: `hero-edge-${index}`,
      source: `hero-${index}`,
      target: `hero-${index + 1}`,
      animated: true
    }));

    return { nodes, edges };
  }, [planningCharacters]);

  const generateCharacterWeb = useCallback(() => {
    const nodes = [];
    const edges = [];
    
    // Central relationship hub
    nodes.push({
      id: 'relationship-center',
      type: 'plot',
      position: { x: 400, y: 300 },
      data: {
        name: 'Character Relationships',
        type: 'plot',
        description: 'Central hub for character interactions',
        fromTemplate: true
      }
    });

    // Add characters in a circle around the center
    planningCharacters.slice(0, 6).forEach((char, index) => {
      const angle = (index * 2 * Math.PI) / Math.min(planningCharacters.length, 6);
      const radius = 200;
      
      nodes.push({
        id: `web-char-${char.planningId}`,
        type: 'character',
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle)
        },
        data: {
          ...char,
          fromTemplate: true
        }
      });

      // Connect each character to the center
      edges.push({
        id: `web-edge-${index}`,
        source: 'relationship-center',
        target: `web-char-${char.planningId}`,
        animated: true,
        style: { stroke: '#8B5CF6' }
      });
    });

    return { nodes, edges };
  }, [planningCharacters]);

  const generatePlotTimeline = useCallback(() => {
    const nodes = [];
    const edges = [];

    // Use actual plot threads from planning data
    plotThreads.slice(0, 5).forEach((plot, index) => {
      nodes.push({
        id: `timeline-plot-${plot.planningId}`,
        type: 'plot',
        position: { x: 100 + (index * 200), y: 100 },
        data: {
          ...plot,
          fromTemplate: true,
          name: `${index + 1}. ${plot.name}`
        }
      });

      // Connect plots in sequence
      if (index > 0) {
        edges.push({
          id: `timeline-edge-${index}`,
          source: `timeline-plot-${plotThreads[index - 1].planningId}`,
          target: `timeline-plot-${plot.planningId}`,
          animated: true,
          label: 'leads to'
        });
      }
    });

    // Add main characters below timeline
    planningCharacters.slice(0, 3).forEach((char, index) => {
      nodes.push({
        id: `timeline-char-${char.planningId}`,
        type: 'character',
        position: { x: 200 + (index * 200), y: 300 },
        data: {
          ...char,
          fromTemplate: true
        }
      });
    });

    return { nodes, edges };
  }, [plotThreads, planningCharacters]);

  // Templates using planning data
  const planningTemplates = [
    {
      id: 'three-act',
      name: '3-Act Structure',
      description: 'Classic story structure with setup, confrontation, and resolution',
      icon: '🎭',
      generator: generateThreeActStructure,
      requiresData: true
    },
    {
      id: 'hero-journey',
      name: 'Hero\'s Journey',
      description: 'Joseph Campbell\'s monomyth story structure',
      icon: '🦸',
      generator: generateHeroJourney,
      requiresData: true
    },
    {
      id: 'character-web',
      name: 'Character Web',
      description: 'Visualize relationships between your characters',
      icon: '🕸️',
      generator: generateCharacterWeb,
      requiresData: true
    },
    {
      id: 'plot-timeline',
      name: 'Plot Timeline',
      description: 'Sequential flow of your plot threads',
      icon: '📅',
      generator: generatePlotTimeline,
      requiresData: true
    }
  ];

  // Sample story templates
  const sampleTemplates = [
    {
      id: 'sample-story',
      name: 'Sample Story',
      description: 'Example story with characters and plot points',
      icon: '📖',
      generator: generateSampleStory,
      requiresData: false
    },
    {
      id: 'fantasy-adventure',
      name: 'Fantasy Adventure',
      description: 'Classic fantasy quest with hero, mentor, and villain',
      icon: '⚔️',
      generator: generateFantasyAdventure,
      requiresData: false
    },
    {
      id: 'mystery-story',
      name: 'Mystery Story',
      description: 'Detective story with suspects and investigation',
      icon: '🔍',
      generator: generateMysteryStory,
      requiresData: false
    }
  ];

  const hasData = planningCharacters.length > 0 || plotThreads.length > 0;
  const availableTemplates = hasData ? planningTemplates : sampleTemplates;
  const allTemplates = [...planningTemplates, ...sampleTemplates];

  const handleTemplateClick = useCallback((template: any) => {
    if (loading) return;
    
    console.log(`📋 Generating template: ${template.name}`);
    const templateData = template.generator();
    onTemplateSelect(templateData);
    setIsOpen(false);
  }, [loading, onTemplateSelect]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={loading}
      >
        <span className="flex items-center gap-2">
          📋 Templates
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Story Templates</h4>
            <p className="text-xs text-gray-500 mt-1">
              {hasData 
                ? `Templates use your planning data (${planningCharacters.length} characters, ${plotThreads.length} plots)`
                : 'Sample templates to get you started - create planning data for personalized templates'
              }
            </p>
          </div>
          
          {hasData && (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Using Your Planning Data
                </h5>
              </div>
              <div className="py-2">
                {planningTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="w-full p-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-blue-50 disabled:opacity-50"
                    disabled={loading}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Sample Stories
            </h5>
          </div>
          <div className="py-2">
            {sampleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="w-full p-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-blue-50 disabled:opacity-50"
                disabled={loading}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!hasData && (
            <div className="p-4 text-center border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Create characters and plots in your planning pages for personalized templates
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
