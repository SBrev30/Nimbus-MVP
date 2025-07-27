    enhancedTypes.location = (props: any) => (
      <LocationNode
        {...props}
        projectId={projectId} // ✅ ADD THIS LINE - MISSING FIX
        onDataChange={(newData: any) => handleNodeDataChange(props.id, newData)}
      />
    );