  const handleSync = useCallback(async () => {
    console.log('🔄 Starting canvas sync...');
    setSyncStatus('syncing');
    
    try {
      await planningData.refresh();
      
      const updatedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.data.fromPlanning && node.data.planningId) {
            if (node.type === 'character') {
              const updatedChar = planningData.planningCharacters.find(
                c => c.id === node.data.planningId
              );
              if (updatedChar) {
                console.log('🔄 Syncing character node:', node.id, 'with planning data:', updatedChar.name);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    name: updatedChar.name,
                    role: updatedChar.role,
                    description: updatedChar.description,
                    completeness_score: updatedChar.completeness_score
                  }
                };
              }
            }
            // NEW: Add plot thread sync support
            if (node.type === 'plot') {
              const updatedPlotThread = planningData.plotThreads.find(
                p => p.id === node.data.planningId
              );
              if (updatedPlotThread) {
                console.log('🔄 Syncing plot node:', node.id, 'with planning data:', updatedPlotThread.title);
                return {
                  ...node,
                  data: {
                    ...node.data,
                    title: updatedPlotThread.title,
                    description: updatedPlotThread.description,
                    plotType: updatedPlotThread.type,
                    completion: updatedPlotThread.completion_percentage,
                    eventCount: updatedPlotThread.event_count,
                    color: updatedPlotThread.color,
                    tensionCurve: updatedPlotThread.tension_curve,
                    tags: updatedPlotThread.tags,
                    connectedCharacters: updatedPlotThread.connected_character_ids,
                    connectedThreads: updatedPlotThread.connected_thread_ids,
                    completeness_score: updatedPlotThread.completion_percentage
                  }
                };
              }
            }
          }
          return node;
        })
      );
      
      setNodes(updatedNodes);
      await forceSave();
      
      setSyncStatus('synced');
      setLastSynced(new Date());
      setHasChanges(false);
      console.log('✅ Canvas sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncStatus('error');
    }
  }, [planningData, nodes, forceSave, setNodes]);