// src/components/canvas/SampleStoryTemplates.tsx
// Use this for immediate testing when planning data is empty

export const generateSampleStory = () => {
  const nodes = [
    {
      id: 'sample-hero',
      type: 'character',
      position: { x: 100, y: 100 },
      data: {
        name: 'Elena Brightblade',
        type: 'character',
        description: 'A skilled knight seeking to restore her family\'s honor',
        role: 'protagonist',
        fromTemplate: true
      }
    },
    {
      id: 'sample-mentor',
      type: 'character',
      position: { x: 300, y: 100 },
      data: {
        name: 'Master Aldric',
        type: 'character',
        description: 'Wise old mage who guides Elena on her quest',
        role: 'mentor',
        fromTemplate: true
      }
    },
    {
      id: 'sample-villain',
      type: 'character',
      position: { x: 500, y: 100 },
      data: {
        name: 'Lord Shadowmere',
        type: 'character',
        description: 'Dark lord who destroyed Elena\'s family and threatens the realm',
        role: 'antagonist',
        fromTemplate: true
      }
    },
    {
      id: 'sample-ally',
      type: 'character',
      position: { x: 200, y: 250 },
      data: {
        name: 'Finn Quickstep',
        type: 'character',
        description: 'Nimble thief who becomes Elena\'s loyal companion',
        role: 'ally',
        fromTemplate: true
      }
    },
    {
      id: 'sample-setup',
      type: 'plot',
      position: { x: 100, y: 400 },
      data: {
        name: 'The Call to Adventure',
        type: 'plot',
        description: 'Elena discovers the truth about her family\'s fate',
        status: 'completed',
        fromTemplate: true
      }
    },
    {
      id: 'sample-journey',
      type: 'plot',
      position: { x: 300, y: 400 },
      data: {
        name: 'The Perilous Journey',
        type: 'plot',
        description: 'Elena and Finn face trials while seeking ancient artifacts',
        status: 'in_progress',
        fromTemplate: true
      }
    },
    {
      id: 'sample-confrontation',
      type: 'plot',
      position: { x: 500, y: 400 },
      data: {
        name: 'Final Confrontation',
        type: 'plot',
        description: 'Elena faces Lord Shadowmere in an epic battle',
        status: 'planning',
        fromTemplate: true
      }
    }
  ];

  const edges = [
    // Character relationships
    {
      id: 'hero-mentor',
      source: 'sample-hero',
      target: 'sample-mentor',
      label: 'learns from',
      style: { stroke: '#10b981' }
    },
    {
      id: 'hero-ally',
      source: 'sample-hero',
      target: 'sample-ally',
      label: 'partners with',
      style: { stroke: '#3b82f6' }
    },
    {
      id: 'hero-villain',
      source: 'sample-hero',
      target: 'sample-villain',
      label: 'opposes',
      style: { stroke: '#ef4444' }
    },
    // Plot progression
    {
      id: 'setup-journey',
      source: 'sample-setup',
      target: 'sample-journey',
      animated: true,
      label: 'leads to'
    },
    {
      id: 'journey-confrontation',
      source: 'sample-journey',
      target: 'sample-confrontation',
      animated: true,
      label: 'builds to'
    },
    // Character-plot connections
    {
      id: 'hero-setup',
      source: 'sample-hero',
      target: 'sample-setup',
      style: { stroke: '#8b5cf6', strokeDasharray: '5,5' }
    },
    {
      id: 'ally-journey',
      source: 'sample-ally',
      target: 'sample-journey',
      style: { stroke: '#8b5cf6', strokeDasharray: '5,5' }
    },
    {
      id: 'villain-confrontation',
      source: 'sample-villain',
      target: 'sample-confrontation',
      style: { stroke: '#8b5cf6', strokeDasharray: '5,5' }
    }
  ];

  return { nodes, edges };
};

export const generateFantasyAdventure = () => {
  const nodes = [
    {
      id: 'chosen-one',
      type: 'character',
      position: { x: 200, y: 50 },
      data: {
        name: 'The Chosen One',
        type: 'character',
        description: 'Reluctant hero with hidden magical abilities',
        role: 'protagonist',
        fromTemplate: true
      }
    },
    {
      id: 'wise-guide',
      type: 'character',
      position: { x: 50, y: 150 },
      data: {
        name: 'Ancient Guardian',
        type: 'character',
        description: 'Mystical being who reveals the hero\'s destiny',
        role: 'mentor',
        fromTemplate: true
      }
    },
    {
      id: 'dark-emperor',
      type: 'character',
      position: { x: 350, y: 150 },
      data: {
        name: 'Shadow Emperor',
        type: 'character',
        description: 'Ancient evil seeking to plunge the world into darkness',
        role: 'antagonist',
        fromTemplate: true
      }
    },
    {
      id: 'ordinary-world',
      type: 'plot',
      position: { x: 100, y: 300 },
      data: {
        name: 'Ordinary World',
        type: 'plot',
        description: 'Hero lives a simple life, unaware of their destiny',
        fromTemplate: true
      }
    },
    {
      id: 'call-adventure',
      type: 'plot',
      position: { x: 300, y: 300 },
      data: {
        name: 'Call to Adventure',
        type: 'plot',
        description: 'A mysterious event disrupts the hero\'s peaceful life',
        fromTemplate: true
      }
    },
    {
      id: 'magical-training',
      type: 'plot',
      position: { x: 500, y: 300 },
      data: {
        name: 'Magical Training',
        type: 'plot',
        description: 'Hero learns to harness their hidden powers',
        fromTemplate: true
      }
    },
    {
      id: 'final-battle',
      type: 'plot',
      position: { x: 700, y: 300 },
      data: {
        name: 'Final Battle',
        type: 'plot',
        description: 'Epic confrontation between light and darkness',
        fromTemplate: true
      }
    }
  ];

  const edges = [
    // Plot progression
    { id: 'ordinary-call', source: 'ordinary-world', target: 'call-adventure', animated: true },
    { id: 'call-training', source: 'call-adventure', target: 'magical-training', animated: true },
    { id: 'training-battle', source: 'magical-training', target: 'final-battle', animated: true },
    
    // Character connections
    { id: 'hero-mentor', source: 'chosen-one', target: 'wise-guide', label: 'guided by' },
    { id: 'hero-villain', source: 'chosen-one', target: 'dark-emperor', label: 'destined to fight', style: { stroke: '#ef4444' } }
  ];

  return { nodes, edges };
};

export const generateMysteryStory = () => {
  const nodes = [
    {
      id: 'detective',
      type: 'character',
      position: { x: 150, y: 100 },
      data: {
        name: 'Detective Sarah Cross',
        type: 'character',
        description: 'Sharp-minded investigator with a troubled past',
        role: 'protagonist',
        fromTemplate: true
      }
    },
    {
      id: 'suspect1',
      type: 'character',
      position: { x: 50, y: 250 },
      data: {
        name: 'The Business Partner',
        type: 'character',
        description: 'Had financial disputes with the victim',
        role: 'suspect',
        fromTemplate: true
      }
    },
    {
      id: 'suspect2',
      type: 'character',
      position: { x: 250, y: 250 },
      data: {
        name: 'The Scorned Lover',
        type: 'character',
        description: 'Recently ended tumultuous relationship with victim',
        role: 'suspect',
        fromTemplate: true
      }
    },
    {
      id: 'the-crime',
      type: 'plot',
      position: { x: 400, y: 100 },
      data: {
        name: 'The Murder',
        type: 'plot',
        description: 'Wealthy entrepreneur found dead in locked study',
        fromTemplate: true
      }
    },
    {
      id: 'investigation',
      type: 'plot',
      position: { x: 550, y: 100 },
      data: {
        name: 'Investigation',
        type: 'plot',
        description: 'Gathering clues and interviewing suspects',
        fromTemplate: true
      }
    },
    {
      id: 'revelation',
      type: 'plot',
      position: { x: 700, y: 100 },
      data: {
        name: 'The Revelation',
        type: 'plot',
        description: 'The truth is revealed in dramatic confrontation',
        fromTemplate: true
      }
    }
  ];

  const edges = [
    // Investigation flow
    { id: 'crime-investigation', source: 'the-crime', target: 'investigation', animated: true },
    { id: 'investigation-revelation', source: 'investigation', target: 'revelation', animated: true },
    
    // Detective connections
    { id: 'detective-crime', source: 'detective', target: 'the-crime', label: 'investigates' },
    { id: 'detective-suspect1', source: 'detective', target: 'suspect1', label: 'questions', style: { strokeDasharray: '5,5' } },
    { id: 'detective-suspect2', source: 'detective', target: 'suspect2', label: 'questions', style: { strokeDasharray: '5,5' } }
  ];

  return { nodes, edges };
};
