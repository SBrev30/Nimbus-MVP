import { 
  ProjectCanvasData, 
  AnalysisResults, 
  ConflictData, 
  CharacterArcAnalysis,
  PlotStructureAnalysis,
  Recommendation,
  PacingAnalysis,
  PlotHole,
  TensionPoint,
  ArcMoment,
  ChapterData,
  CharacterData
} from '../types/masterCanvas';

/**
 * Service for AI-powered plot and story analysis
 */
export class PlotAnalysisService {
  
  /**
   * Analyze a complete project for plot holes, character issues, and structure problems
   */
  async analyzeProject(projectData: ProjectCanvasData): Promise<AnalysisResults> {
    const conflicts: ConflictData[] = [];
    
    try {
      // Character consistency analysis
      const characterConflicts = await this.analyzeCharacterConsistency(projectData);
      conflicts.push(...characterConflicts);
      
      // Timeline analysis
      const timelineConflicts = await this.analyzeTimeline(projectData);
      conflicts.push(...timelineConflicts);
      
      // Plot logic analysis
      const plotConflicts = await this.analyzePlotLogic(projectData);
      conflicts.push(...plotConflicts);
      
      // Character motivation analysis
      const motivationConflicts = await this.analyzeCharacterMotivations(projectData);
      conflicts.push(...motivationConflicts);
      
      // Generate character arc analysis
      const characterArcs = await this.analyzeCharacterArcs(projectData);
      
      // Analyze plot structure
      const plotStructure = await this.analyzePlotStructure(projectData);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(conflicts, characterArcs, plotStructure);
      
      // Calculate overall story score
      const overallScore = this.calculateStoryScore(conflicts, characterArcs, plotStructure);
      
      return {
        conflicts,
        overallScore,
        recommendations,
        characterArcs,
        plotStructure
      };
      
    } catch (error) {
      console.error('Analysis failed:', error);
      throw new Error(`Plot analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Analyze character consistency across chapters
   */
  private async analyzeCharacterConsistency(data: ProjectCanvasData): Promise<ConflictData[]> {
    const conflicts: ConflictData[] = [];
    
    for (const character of data.characters) {
      // Find chapters where character appears
      const appearances = data.chapters.filter(chapter => 
        character.appearances.includes(chapter.id)
      );
      
      if (appearances.length === 0) {
        conflicts.push({
          id: `char-unused-${character.id}`,
          type: 'character',
          severity: 'medium',
          description: `Character "${character.name}" is defined but never appears in any chapters`,
          suggestedFix: 'Consider removing this character or adding them to relevant chapters',
          confidence: 0.9,
          characterId: character.id
        });
      }
      
      // Check for characters appearing in non-consecutive chapters without explanation
      if (appearances.length > 1) {
        const chapterNumbers = appearances.map(ch => ch.number).sort((a, b) => a - b);
        const gaps = this.findSignificantGaps(chapterNumbers);
        
        for (const gap of gaps) {
          conflicts.push({
            id: `char-gap-${character.id}-${gap.start}-${gap.end}`,
            type: 'character',
            severity: 'low',
            description: `Character "${character.name}" disappears between chapters ${gap.start} and ${gap.end} without explanation`,
            suggestedFix: 'Consider adding a brief mention of what happened to this character during their absence',
            confidence: 0.7,
            characterId: character.id
          });
        }
      }
      
      // Check for role consistency
      if (character.role === 'protagonist' && character.appearances.length < data.chapters.length * 0.6) {
        conflicts.push({
          id: `protag-absent-${character.id}`,
          type: 'character',
          severity: 'high',
          description: `Protagonist "${character.name}" is absent from ${Math.round((1 - character.appearances.length / data.chapters.length) * 100)}% of chapters`,
          suggestedFix: 'Protagonists should have a presence in most chapters, even if not physically present',
          confidence: 0.85,
          characterId: character.id
        });
      }
    }
    
    return conflicts;
  }
  
  /**
   * Analyze timeline consistency
   */
  private async analyzeTimeline(data: ProjectCanvasData): Promise<ConflictData[]> {
    const conflicts: ConflictData[] = [];
    
    // Check for timeline inconsistencies in plot events
    const allEvents = data.chapters.flatMap(chapter => 
      chapter.plotEvents.map(event => ({ ...event, chapterId: chapter.id, chapterNumber: chapter.number }))
    );
    
    // Look for events that should be in chronological order
    const climaxEvents = allEvents.filter(event => event.type === 'climax');
    if (climaxEvents.length > 1) {
      conflicts.push({
        id: 'multiple-climax',
        type: 'timeline',
        severity: 'high',
        description: 'Multiple climax events detected - stories should typically have only one main climax',
        suggestedFix: 'Consider restructuring to have one main climax with supporting tensions',
        confidence: 0.8
      });
    }
    
    // Check for climax before rising action
    const firstClimaxChapter = climaxEvents[0]?.chapterNumber;
    const risingActionEvents = allEvents.filter(event => event.type === 'rising_action');
    const lastRisingActionChapter = Math.max(...risingActionEvents.map(e => e.chapterNumber));
    
    if (firstClimaxChapter && lastRisingActionChapter && firstClimaxChapter < lastRisingActionChapter) {
      conflicts.push({
        id: 'climax-before-rising-action',
        type: 'timeline',
        severity: 'high',
        description: 'Climax occurs before the end of rising action - this disrupts story structure',
        suggestedFix: 'Move rising action events before the climax, or restructure the plot events',
        confidence: 0.9
      });
    }
    
    return conflicts;
  }
  
  /**
   * Analyze plot logic and consistency
   */
  private async analyzePlotLogic(data: ProjectCanvasData): Promise<ConflictData[]> {
    const conflicts: ConflictData[] = [];
    
    // Check for missing story elements
    const hasIncitingIncident = data.chapters.some(chapter =>
      chapter.plotEvents.some(event => event.type === 'inciting_incident')
    );
    
    if (!hasIncitingIncident) {
      conflicts.push({
        id: 'missing-inciting-incident',
        type: 'logic',
        severity: 'high',
        description: 'No inciting incident found - stories need a clear event that starts the main conflict',
        suggestedFix: 'Add an inciting incident early in your story to kick off the main plot',
        confidence: 0.85
      });
    }
    
    // Check for resolution without climax
    const hasClimax = data.chapters.some(chapter =>
      chapter.plotEvents.some(event => event.type === 'climax')
    );
    
    const hasResolution = data.chapters.some(chapter =>
      chapter.plotEvents.some(event => event.type === 'resolution')
    );
    
    if (hasResolution && !hasClimax) {
      conflicts.push({
        id: 'resolution-without-climax',
        type: 'logic',
        severity: 'medium',
        description: 'Story has resolution but no clear climax',
        suggestedFix: 'Add a climactic moment before the resolution where the main conflict reaches its peak',
        confidence: 0.8
      });
    }
    
    return conflicts;
  }
  
  /**
   * Analyze character motivations
   */
  private async analyzeCharacterMotivations(data: ProjectCanvasData): Promise<ConflictData[]> {
    const conflicts: ConflictData[] = [];
    
    // Check for characters without clear motivations
    for (const character of data.characters) {
      if (character.role === 'protagonist' || character.role === 'antagonist') {
        // In a full implementation, this would analyze character descriptions and actions
        // For now, we'll do basic checks
        
        if (!character.description || character.description.length < 50) {
          conflicts.push({
            id: `weak-motivation-${character.id}`,
            type: 'motivation',
            severity: character.role === 'protagonist' ? 'high' : 'medium',
            description: `${character.role} "${character.name}" lacks sufficient background or motivation description`,
            suggestedFix: 'Develop this character\'s backstory, goals, and motivations more clearly',
            confidence: 0.75,
            characterId: character.id
          });
        }
        
        // Check for relationships - important characters should have relationships
        if (character.relationships.length === 0) {
          conflicts.push({
            id: `isolated-character-${character.id}`,
            type: 'motivation',
            severity: 'medium',
            description: `Important character "${character.name}" has no defined relationships with other characters`,
            suggestedFix: 'Define relationships with other characters to create more engaging interactions',
            confidence: 0.7,
            characterId: character.id
          });
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Analyze character development arcs
   */
  private async analyzeCharacterArcs(data: ProjectCanvasData): Promise<CharacterArcAnalysis[]> {
    return data.characters.map(character => {
      const appearances = data.chapters.filter(chapter => 
        character.appearances.includes(chapter.id)
      ).sort((a, b) => a.number - b.number);
      
      // Simplified arc analysis - in full implementation would be more sophisticated
      const completeness = this.calculateArcCompleteness(character, appearances);
      const arcType = this.determineArcType(character, appearances);
      
      return {
        characterId: character.id,
        arcType,
        completeness,
        keyMoments: this.identifyKeyMoments(character, appearances),
        issues: this.identifyArcIssues(character, appearances)
      };
    });
  }
  
  /**
   * Analyze overall plot structure
   */
  private async analyzePlotStructure(data: ProjectCanvasData): Promise<PlotStructureAnalysis> {
    // Determine story structure
    const structure = this.identifyStoryStructure(data);
    
    // Analyze pacing
    const pacing = this.analyzePacing(data);
    
    // Find plot holes
    const plotHoles = this.findPlotHoles(data);
    
    // Calculate tension curve
    const tensionCurve = this.calculateTensionCurve(data);
    
    return {
      structure,
      pacing,
      plotHoles,
      tensionCurve
    };
  }
  
  /**
   * Helper method to find significant gaps in chapter appearances
   */
  private findSignificantGaps(chapterNumbers: number[]): Array<{start: number, end: number}> {
    const gaps = [];
    for (let i = 0; i < chapterNumbers.length - 1; i++) {
      const gap = chapterNumbers[i + 1] - chapterNumbers[i];
      if (gap > 2) { // More than 2 chapters gap
        gaps.push({
          start: chapterNumbers[i],
          end: chapterNumbers[i + 1]
        });
      }
    }
    return gaps;
  }
  
  /**
   * Calculate character arc completeness
   */
  private calculateArcCompleteness(character: CharacterData, appearances: ChapterData[]): number {
    // Simplified calculation - in reality would analyze character development
    const factors = [
      character.description.length > 100 ? 25 : 10, // Has detailed description
      character.relationships.length > 0 ? 25 : 0,  // Has relationships
      appearances.length > 1 ? 25 : 0,              // Appears multiple times
      character.role !== 'minor' ? 25 : 15          // Important role
    ];
    
    return Math.min(100, factors.reduce((sum, factor) => sum + factor, 0));
  }
  
  /**
   * Determine character arc type
   */
  private determineArcType(character: CharacterData, appearances: ChapterData[]): 'positive' | 'negative' | 'flat' {
    // Simplified determination - would analyze character growth in full implementation
    if (character.role === 'protagonist') return 'positive';
    if (character.role === 'antagonist') return 'negative';
    return 'flat';
  }
  
  /**
   * Identify key character moments
   */
  private identifyKeyMoments(character: CharacterData, appearances: ChapterData[]): ArcMoment[] {
    const moments: ArcMoment[] = [];
    
    if (appearances.length > 0) {
      moments.push({
        chapterId: appearances[0].id,
        type: 'introduction',
        description: `${character.name} is introduced to the story`
      });
      
      if (appearances.length > 1) {
        const midPoint = Math.floor(appearances.length / 2);
        moments.push({
          chapterId: appearances[midPoint].id,
          type: 'development',
          description: `Key development moment for ${character.name}`
        });
        
        moments.push({
          chapterId: appearances[appearances.length - 1].id,
          type: 'resolution',
          description: `${character.name}'s arc concludes`
        });
      }
    }
    
    return moments;
  }
  
  /**
   * Identify character arc issues
   */
  private identifyArcIssues(character: CharacterData, appearances: ChapterData[]): string[] {
    const issues = [];
    
    if (appearances.length === 0) {
      issues.push('Character never appears in the story');
    }
    
    if (character.description.length < 50) {
      issues.push('Insufficient character development');
    }
    
    if (character.relationships.length === 0 && character.role !== 'minor') {
      issues.push('No relationships with other characters');
    }
    
    return issues;
  }
  
  /**
   * Identify story structure type
   */
  private identifyStoryStructure(data: ProjectCanvasData): string {
    const eventTypes = data.chapters.flatMap(ch => ch.plotEvents.map(e => e.type));
    
    if (eventTypes.includes('inciting_incident') && 
        eventTypes.includes('climax') && 
        eventTypes.includes('resolution')) {
      return 'Three-Act Structure';
    }
    
    return 'Custom Structure';
  }
  
  /**
   * Analyze story pacing
   */
  private analyzePacing(data: ProjectCanvasData): PacingAnalysis {
    const issues = [];
    const totalChapters = data.chapters.length;
    
    // Check for slow start
    const firstThirdChapters = data.chapters.slice(0, Math.ceil(totalChapters / 3));
    const hasEarlyAction = firstThirdChapters.some(ch => 
      ch.plotEvents.some(e => e.type === 'inciting_incident')
    );
    
    if (!hasEarlyAction) {
      issues.push({
        chapterId: firstThirdChapters[firstThirdChapters.length - 1]?.id || '',
        type: 'slow_start' as const,
        description: 'Story may start too slowly - no inciting incident in first third',
        suggestion: 'Consider introducing conflict or tension earlier'
      });
    }
    
    // Determine overall pace
    const actionDensity = data.chapters.reduce((sum, ch) => sum + ch.plotEvents.length, 0) / totalChapters;
    let overallPace: 'too_slow' | 'appropriate' | 'too_fast';
    
    if (actionDensity < 1) overallPace = 'too_slow';
    else if (actionDensity > 3) overallPace = 'too_fast';
    else overallPace = 'appropriate';
    
    return {
      overallPace,
      issues
    };
  }
  
  /**
   * Find plot holes and inconsistencies
   */
  private findPlotHoles(data: ProjectCanvasData): PlotHole[] {
    const plotHoles = [];
    
    // Check for unresolved plot threads
    const allEvents = data.chapters.flatMap(ch => ch.plotEvents);
    const hasResolution = allEvents.some(e => e.type === 'resolution');
    const hasConflict = allEvents.some(e => e.type === 'rising_action' || e.type === 'climax');
    
    if (hasConflict && !hasResolution) {
      plotHoles.push({
        id: 'unresolved-conflict',
        type: 'unresolved_thread',
        description: 'Main conflict introduced but never resolved',
        chaptersInvolved: data.chapters.filter(ch => 
          ch.plotEvents.some(e => e.type === 'rising_action' || e.type === 'climax')
        ).map(ch => ch.id),
        severity: 'high',
        suggestedFix: 'Add a resolution that addresses the main conflict'
      });
    }
    
    return plotHoles;
  }
  
  /**
   * Calculate tension curve across chapters
   */
  private calculateTensionCurve(data: ProjectCanvasData): TensionPoint[] {
    return data.chapters.map(chapter => {
      // Simplified tension calculation
      const eventIntensity = chapter.plotEvents.reduce((sum, event) => {
        switch (event.type) {
          case 'climax': return sum + 100;
          case 'rising_action': return sum + 60;
          case 'inciting_incident': return sum + 40;
          case 'falling_action': return sum + 30;
          case 'resolution': return sum + 20;
          default: return sum + 10;
        }
      }, 0);
      
      const characterCount = chapter.characters.length * 5;
      const tensionLevel = Math.min(100, eventIntensity + characterCount);
      
      return {
        chapterId: chapter.id,
        tensionLevel,
        events: chapter.plotEvents.map(e => e.description)
      };
    });
  }
  
  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    conflicts: ConflictData[], 
    characterArcs: CharacterArcAnalysis[],
    plotStructure: PlotStructureAnalysis
  ): Recommendation[] {
    const recommendations = [];
    
    // High priority conflicts become high priority recommendations
    const highPriorityConflicts = conflicts.filter(c => c.severity === 'high');
    for (const conflict of highPriorityConflicts.slice(0, 3)) { // Top 3
      recommendations.push({
        id: `rec-${conflict.id}`,
        type: conflict.type,
        priority: 'high',
        title: `Address ${conflict.type} issue`,
        description: conflict.description,
        suggestedAction: conflict.suggestedFix || 'Review and revise this element'
      });
    }
    
    // Character development recommendations
    const incompleteArcs = characterArcs.filter(arc => arc.completeness < 60);
    if (incompleteArcs.length > 0) {
      recommendations.push({
        id: 'develop-characters',
        type: 'character',
        priority: 'medium',
        title: 'Develop character arcs',
        description: `${incompleteArcs.length} characters need more development`,
        suggestedAction: 'Focus on character backstory, motivations, and growth throughout the story'
      });
    }
    
    // Plot structure recommendations
    if (plotStructure.pacing.overallPace === 'too_slow') {
      recommendations.push({
        id: 'improve-pacing',
        type: 'structure',
        priority: 'medium',
        title: 'Improve story pacing',
        description: 'Story pacing appears too slow',
        suggestedAction: 'Add more conflict, tension, or action to maintain reader engagement'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate overall story quality score
   */
  private calculateStoryScore(
    conflicts: ConflictData[], 
    characterArcs: CharacterArcAnalysis[],
    plotStructure: PlotStructureAnalysis
  ): number {
    let score = 100;
    
    // Deduct for conflicts
    conflicts.forEach(conflict => {
      switch (conflict.severity) {
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    });
    
    // Deduct for incomplete character arcs
    const avgCharacterCompleteness = characterArcs.reduce((sum, arc) => sum + arc.completeness, 0) / characterArcs.length;
    score -= (100 - avgCharacterCompleteness) * 0.2;
    
    // Adjust for plot structure
    if (plotStructure.plotHoles.length > 0) {
      score -= plotStructure.plotHoles.length * 5;
    }
    
    return Math.max(0, Math.round(score));
  }
}

// Export singleton instance
export const plotAnalysisService = new PlotAnalysisService();
