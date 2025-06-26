import { Node, Edge } from 'reactflow';

export interface Template {
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

export const templates: Record<string, Template> = {
  heroJourney: {
    name: "Hero's Journey",
    description: "Classic monomyth structure with archetypal characters",
    nodes: [
      {
        id: 'hero',
        type: 'character',
        position: { x: 100, y: 100 },
        data: {
          name: 'The Hero',
          role: 'protagonist',
          description: 'The main character who embarks on the journey'
        }
      },
      {
        id: 'mentor',
        type: 'character',
        position: { x: 300, y: 100 },
        data: {
          name: 'The Mentor',
          role: 'supporting',
          description: 'Wise guide who helps the hero'
        }
      },
      {
        id: 'villain',
        type: 'character',
        position: { x: 500, y: 100 },
        data: {
          name: 'The Shadow',
          role: 'antagonist',
          description: 'The primary antagonist or dark force'
        }
      },
      {
        id: 'call',
        type: 'plot',
        position: { x: 100, y: 300 },
        data: {
          title: 'Call to Adventure',
          type: 'event',
          description: 'The inciting incident that starts the journey'
        }
      },
      {
        id: 'ordeal',
        type: 'plot',
        position: { x: 300, y: 300 },
        data: {
          title: 'The Ordeal',
          type: 'conflict',
          description: 'The central crisis or most difficult challenge'
        }
      },
      {
        id: 'return',
        type: 'plot',
        position: { x: 500, y: 300 },
        data: {
          title: 'Return with Elixir',
          type: 'resolution',
          description: 'Hero returns transformed with wisdom or power'
        }
      }
    ],
    edges: [
      {
        id: 'hero-mentor',
        source: 'hero',
        target: 'mentor',
        type: 'smoothstep',
        label: 'guided by'
      },
      {
        id: 'hero-villain',
        source: 'hero',
        target: 'villain',
        type: 'smoothstep',
        label: 'opposes'
      },
      {
        id: 'call-ordeal',
        source: 'call',
        target: 'ordeal',
        type: 'smoothstep',
        label: 'leads to'
      },
      {
        id: 'ordeal-return',
        source: 'ordeal',
        target: 'return',
        type: 'smoothstep',
        label: 'enables'
      }
    ]
  },

  threeAct: {
    name: "Three-Act Structure",
    description: "Classic screenplay structure with setup, confrontation, and resolution",
    nodes: [
      {
        id: 'protagonist',
        type: 'character',
        position: { x: 200, y: 50 },
        data: {
          name: 'Protagonist',
          role: 'protagonist',
          description: 'Main character driving the story'
        }
      },
      {
        id: 'antagonist',
        type: 'character',
        position: { x: 400, y: 50 },
        data: {
          name: 'Antagonist',
          role: 'antagonist',
          description: 'Opposition force or character'
        }
      },
      {
        id: 'setup',
        type: 'plot',
        position: { x: 100, y: 200 },
        data: {
          title: 'Act I: Setup',
          type: 'event',
          description: 'Establish characters, world, and central conflict'
        }
      },
      {
        id: 'confrontation',
        type: 'plot',
        position: { x: 300, y: 200 },
        data: {
          title: 'Act II: Confrontation',
          type: 'conflict',
          description: 'Develop conflict, obstacles, and character growth'
        }
      },
      {
        id: 'resolution',
        type: 'plot',
        position: { x: 500, y: 200 },
        data: {
          title: 'Act III: Resolution',
          type: 'resolution',
          description: 'Climax and resolution of central conflict'
        }
      }
    ],
    edges: [
      {
        id: 'setup-confrontation',
        source: 'setup',
        target: 'confrontation',
        type: 'smoothstep',
        label: 'escalates to'
      },
      {
        id: 'confrontation-resolution',
        source: 'confrontation',
        target: 'resolution',
        type: 'smoothstep',
        label: 'climaxes in'
      }
    ]
  },

  mysteryStructure: {
    name: "Mystery Structure",
    description: "Classic mystery/detective story template",
    nodes: [
      {
        id: 'detective',
        type: 'character',
        position: { x: 150, y: 50 },
        data: {
          name: 'Detective',
          role: 'protagonist',
          description: 'The investigator solving the mystery'
        }
      },
      {
        id: 'victim',
        type: 'character',
        position: { x: 350, y: 50 },
        data: {
          name: 'Victim',
          role: 'minor',
          description: 'The person who was wronged'
        }
      },
      {
        id: 'culprit',
        type: 'character',
        position: { x: 550, y: 50 },
        data: {
          name: 'Culprit',
          role: 'antagonist',
          description: 'The person responsible for the crime'
        }
      },
      {
        id: 'crime',
        type: 'plot',
        position: { x: 100, y: 200 },
        data: {
          title: 'The Crime',
          type: 'event',
          description: 'The inciting incident - murder, theft, etc.'
        }
      },
      {
        id: 'investigation',
        type: 'plot',
        position: { x: 300, y: 200 },
        data: {
          title: 'Investigation',
          type: 'event',
          description: 'Gathering clues and following leads'
        }
      },
      {
        id: 'revelation',
        type: 'plot',
        position: { x: 500, y: 200 },
        data: {
          title: 'Revelation',
          type: 'resolution',
          description: 'The truth is revealed and culprit exposed'
        }
      }
    ],
    edges: [
      {
        id: 'crime-investigation',
        source: 'crime',
        target: 'investigation',
        type: 'smoothstep',
        label: 'triggers'
      },
      {
        id: 'investigation-revelation',
        source: 'investigation',
        target: 'revelation',
        type: 'smoothstep',
        label: 'leads to'
      }
    ]
  },

  romanceStructure: {
    name: "Romance Arc",
    description: "Classic romance story progression",
    nodes: [
      {
        id: 'loveInterest1',
        type: 'character',
        position: { x: 100, y: 50 },
        data: {
          name: 'Love Interest A',
          role: 'protagonist',
          description: 'First romantic lead'
        }
      },
      {
        id: 'loveInterest2',
        type: 'character',
        position: { x: 300, y: 50 },
        data: {
          name: 'Love Interest B',
          role: 'protagonist',
          description: 'Second romantic lead'
        }
      },
      {
        id: 'meetCute',
        type: 'plot',
        position: { x: 50, y: 200 },
        data: {
          title: 'Meet Cute',
          type: 'event',
          description: 'The charming first encounter'
        }
      },
      {
        id: 'attraction',
        type: 'plot',
        position: { x: 200, y: 200 },
        data: {
          title: 'Growing Attraction',
          type: 'event',
          description: 'Building romantic tension'
        }
      },
      {
        id: 'conflict',
        type: 'plot',
        position: { x: 350, y: 200 },
        data: {
          title: 'Romantic Conflict',
          type: 'conflict',
          description: 'Obstacle that separates the lovers'
        }
      },
      {
        id: 'reunion',
        type: 'plot',
        position: { x: 500, y: 200 },
        data: {
          title: 'Reunion & Resolution',
          type: 'resolution',
          description: 'Overcoming obstacles to be together'
        }
      }
    ],
    edges: [
      {
        id: 'meet-attraction',
        source: 'meetCute',
        target: 'attraction',
        type: 'smoothstep',
        label: 'develops into'
      },
      {
        id: 'attraction-conflict',
        source: 'attraction',
        target: 'conflict',
        type: 'smoothstep',
        label: 'challenged by'
      },
      {
        id: 'conflict-reunion',
        source: 'conflict',
        target: 'reunion',
        type: 'smoothstep',
        label: 'resolved in'
      }
    ]
  },

  fantasyQuest: {
    name: "Fantasy Quest",
    description: "Epic fantasy adventure structure",
    nodes: [
      {
        id: 'chosenOne',
        type: 'character',
        position: { x: 100, y: 50 },
        data: {
          name: 'The Chosen One',
          role: 'protagonist',
          description: 'Reluctant hero with hidden powers'
        }
      },
      {
        id: 'wizard',
        type: 'character',
        position: { x: 300, y: 50 },
        data: {
          name: 'Wise Wizard',
          role: 'supporting',
          description: 'Ancient mentor with magical knowledge'
        }
      },
      {
        id: 'darkLord',
        type: 'character',
        position: { x: 500, y: 50 },
        data: {
          name: 'Dark Lord',
          role: 'antagonist',
          description: 'Ancient evil threatening the realm'
        }
      },
      {
        id: 'fellowship',
        type: 'character',
        position: { x: 700, y: 50 },
        data: {
          name: 'Fellowship',
          role: 'supporting',
          description: 'Loyal companions on the quest'
        }
      },
      {
        id: 'prophecy',
        type: 'plot',
        position: { x: 50, y: 250 },
        data: {
          title: 'The Prophecy',
          type: 'event',
          description: 'Ancient prediction sets events in motion'
        }
      },
      {
        id: 'questBegins',
        type: 'plot',
        position: { x: 200, y: 250 },
        data: {
          title: 'Quest Begins',
          type: 'event',
          description: 'Journey to find the magical artifact'
        }
      },
      {
        id: 'trials',
        type: 'plot',
        position: { x: 350, y: 250 },
        data: {
          title: 'Trials & Tribulations',
          type: 'conflict',
          description: 'Facing monsters, betrayal, and loss'
        }
      },
      {
        id: 'finalBattle',
        type: 'plot',
        position: { x: 500, y: 250 },
        data: {
          title: 'Final Battle',
          type: 'conflict',
          description: 'Climactic confrontation with dark forces'
        }
      },
      {
        id: 'newAge',
        type: 'plot',
        position: { x: 650, y: 250 },
        data: {
          title: 'New Age of Peace',
          type: 'resolution',
          description: 'The realm is saved and transformed'
        }
      }
    ],
    edges: [
      {
        id: 'prophecy-quest',
        source: 'prophecy',
        target: 'questBegins',
        type: 'smoothstep',
        label: 'initiates'
      },
      {
        id: 'quest-trials',
        source: 'questBegins',
        target: 'trials',
        type: 'smoothstep',
        label: 'encounters'
      },
      {
        id: 'trials-battle',
        source: 'trials',
        target: 'finalBattle',
        type: 'smoothstep',
        label: 'culminates in'
      },
      {
        id: 'battle-peace',
        source: 'finalBattle',
        target: 'newAge',
        type: 'smoothstep',
        label: 'brings about'
      }
    ]
  }
};
