// Export core services for Canvas Planning Integration
export { chapterService } from './chapterService';
export { projectService } from './projectService';
export { userService } from './userService';
export { autoSaveService } from './autoSaveService';
export { outlineService } from './outlineService';
export { characterService } from './character-service';
export { worldBuildingService } from './world-building-service';
export { plotService } from './plot-service';

// Export Canvas Integration services
export { canvasIntegrationService } from './canvas-integration-service';
export { autoConnectionsService } from './auto-connections-service';

// Export service types
export type { 
  OutlineNode, 
  CreateOutlineNodeData 
} from './outlineService';

export type {
  Character,
  CreateCharacterData
} from './character-service';

export type {
  WorldElement,
  CreateWorldElementData
} from './world-building-service';

export type {
  PlotThread,
  CreatePlotThreadData
} from './plot-service';

// Re-export common types that might be used across services
export type {
  Project,
  Chapter,
  PlotPoint,
  WorldBuildingElement,
  Note,
  EditorContent
} from '../Type';
