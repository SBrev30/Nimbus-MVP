// Sample story templates and data extracted from EnhancedCanvas
export const sampleStories = {
  mysteryNovel: {
    title: "The Lighthouse Keeper's Secret",
    genre: "Mystery",
    nodes: [
      {
        id: "char-1",
        type: "character",
        position: { x: 100, y: 100 },
        data: {
          name: "Detective Sarah Chen",
          role: "protagonist",
          description: "A sharp-witted detective with a troubled past, drawn to cases that others have given up on.",
          traits: ["observant", "persistent", "haunted by failure"]
        }
      },
      {
        id: "char-2",
        type: "character",
        position: { x: 400, y: 100 },
        data: {
          name: "Marcus Blackwood",
          role: "antagonist",
          description: "The enigmatic lighthouse keeper harboring a dark secret from his maritime past.",
          traits: ["secretive", "intelligent", "desperate"]
        }
      },
      {
        id: "loc-1",
        type: "location",
        position: { x: 250, y: 250 },
        data: {
          name: "Beacon Point Lighthouse",
          type: "landmark",
          description: "An isolated lighthouse on a rocky cliff, site of mysterious disappearances.",
          importance: "high"
        }
      },
      {
        id: "plot-1",
        type: "plot",
        position: { x: 100, y: 400 },
        data: {
          title: "The Missing Sailor",
          type: "event",
          description: "A sailor vanishes near the lighthouse during a storm, leaving behind only a cryptic message.",
          significance: "high"
        }
      }
    ],
    edges: [
      {
        id: "edge-1",
        source: "char-1",
        target: "plot-1",
        label: "investigates"
      },
      {
        id: "edge-2",
        source: "char-2",
        target: "loc-1",
        label: "guards secret at"
      }
    ]
  },
  
  fantasyEpic: {
    title: "The Shattered Crown",
    genre: "Fantasy",
    nodes: [
      {
        id: "char-f1",
        type: "character",
        position: { x: 150, y: 50 },
        data: {
          name: "Lyra Stormwind",
          role: "protagonist",
          description: "A young mage discovering her connection to an ancient prophecy.",
          fantasyClass: "Storm Mage",
          traits: ["powerful", "inexperienced", "destined"]
        }
      },
      {
        id: "char-f2",
        type: "character",
        position: { x: 450, y: 50 },
        data: {
          name: "Theron Shadowbane",
          role: "antagonist",
          description: "A fallen paladin seeking to corrupt the realm's magic for his own ends.",
          fantasyClass: "Death Knight",
          traits: ["corrupted", "strategic", "relentless"]
        }
      },
      {
        id: "theme-f1",
        type: "theme",
        position: { x: 300, y: 200 },
        data: {
          title: "Power and Responsibility",
          type: "major",
          description: "The weight of destiny and the choices we make when given great power."
        }
      },
      {
        id: "conflict-f1",
        type: "conflict",
        position: { x: 150, y: 350 },
        data: {
          title: "The Corruption of Magic",
          type: "external",
          description: "Dark forces are poisoning the realm's magical essence.",
          parties: ["Lyra", "Theron", "The Realm"]
        }
      }
    ],
    edges: [
      {
        id: "edge-f1",
        source: "char-f1",
        target: "theme-f1",
        label: "embodies"
      },
      {
        id: "edge-f2",
        source: "char-f2",
        target: "conflict-f1",
        label: "causes"
      }
    ]
  },
  
  sciFiThriller: {
    title: "Neural Echo",
    genre: "Science Fiction",
    nodes: [
      {
        id: "char-sf1",
        type: "character",
        position: { x: 200, y: 100 },
        data: {
          name: "Dr. Maya Reeves",
          role: "protagonist",
          description: "A neuroscientist who discovers consciousness can be transferred between minds.",
          traits: ["brilliant", "ethical", "determined"]
        }
      },
      {
        id: "research-sf1",
        type: "research",
        position: { x: 500, y: 100 },
        data: {
          title: "Consciousness Transfer Technology",
          content: "Theoretical framework for neural pattern extraction and implantation.",
          category: "technical",
          credibility: "high"
        }
      },
      {
        id: "timeline-sf1",
        type: "timeline",
        position: { x: 200, y: 300 },
        data: {
          title: "The First Transfer",
          type: "turning_point",
          description: "The first successful consciousness transfer changes everything.",
          timeframe: "Day 45",
          significance: "high"
        }
      }
    ],
    edges: [
      {
        id: "edge-sf1",
        source: "char-sf1",
        target: "research-sf1",
        label: "develops"
      },
      {
        id: "edge-sf2",
        source: "research-sf1",
        target: "timeline-sf1",
        label: "leads to"
      }
    ]
  }
};

// Story analysis templates
export const storyAnalysisTemplates = {
  characterDevelopment: {
    questions: [
      "What does this character want most?",
      "What's stopping them from getting it?",
      "How do they change throughout the story?",
      "What's their greatest fear?",
      "What would they never do?"
    ]
  },
  
  plotStructure: {
    threeAct: {
      act1: "Setup - Introduce characters, world, and inciting incident",
      act2: "Confrontation - Rising action, obstacles, and midpoint reversal",
      act3: "Resolution - Climax, falling action, and denouement"
    },
    
    heroJourney: [
      "Ordinary World",
      "Call to Adventure",
      "Refusal of the Call",
      "Meeting the Mentor",
      "Crossing the Threshold",
      "Tests and Allies",
      "Approach to the Ordeal",
      "The Ordeal",
      "Reward",
      "The Road Back",
      "Resurrection",
      "Return with Elixir"
    ]
  },
  
  worldBuilding: {
    elements: [
      "Geography and Climate",
      "Political Systems",
      "Economic Structure",
      "Social Hierarchy",
      "Technology Level",
      "Magic/Science Systems",
      "Culture and Customs",
      "History and Mythology",
      "Languages",
      "Religion and Beliefs"
    ]
  }
};

// Export individual templates for easy access
export const { mysteryNovel, fantasyEpic, sciFiThriller } = sampleStories;
export default sampleStories;