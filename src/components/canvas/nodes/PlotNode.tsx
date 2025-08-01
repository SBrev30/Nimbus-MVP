      )}

      {/* Plot Popup - Similar to CharacterPopup */}
      {showPopup && data.fromPlanning && (
        <PlotPopup
          plot={{
            id: data.planningId || data.id || id,
            title: data.title || '',
            type: data.plotType || data.type,
            description: data.description || '',
            completion: data.completion,
            eventCount: data.eventCount
          }}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          onExpand={() => {
            console.log('Expand plot:', data.planningId);
            if (onEdit) {
              onEdit();
            }
            setShowPopup(false);
          }}
        />
      )}
    </>
  );
};

// Export the component wrapped with canvas functionality
export const PlotNode = withCanvasComponent(PlotNodeComponent);

// Default data for new plot nodes
export const defaultPlotData: PlotNodeData = {
  title: '',
  type: 'event',
  description: '',
  significance: 'medium',
  fromPlanning: false
};
