-- Enhanced Canvas Tables for Supabase Integration
-- Fixed version without duplicate function/trigger creation

-- Create canvas_states table
CREATE TABLE canvas_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
  settings JSONB DEFAULT '{"mode": "exploratory", "theme": "light", "grid_enabled": true, "minimap_enabled": true}',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canvas_nodes table
CREATE TABLE canvas_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES canvas_states(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL CHECK (node_type IN ('character', 'plot', 'location', 'theme', 'conflict', 'timeline', 'research')),
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  node_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canvas_edges table
CREATE TABLE canvas_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES canvas_states(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL, -- Using TEXT to match ReactFlow node IDs
  target_node_id TEXT NOT NULL,
  edge_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX canvas_states_user_project_idx ON canvas_states(user_id, project_id);
CREATE INDEX canvas_states_updated_at_idx ON canvas_states(updated_at DESC);
CREATE INDEX canvas_nodes_canvas_id_idx ON canvas_nodes(canvas_id);
CREATE INDEX canvas_nodes_type_idx ON canvas_nodes(node_type);
CREATE INDEX canvas_edges_canvas_id_idx ON canvas_edges(canvas_id);
CREATE INDEX canvas_edges_source_target_idx ON canvas_edges(source_node_id, target_node_id);

-- Enable Row Level Security (RLS)
ALTER TABLE canvas_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canvas_states
CREATE POLICY "Users can view own canvas states" ON canvas_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canvas states" ON canvas_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvas states" ON canvas_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas states" ON canvas_states
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for canvas_nodes
CREATE POLICY "Users can view canvas nodes they own" ON canvas_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_nodes.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert canvas nodes they own" ON canvas_nodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_nodes.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update canvas nodes they own" ON canvas_nodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_nodes.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete canvas nodes they own" ON canvas_nodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_nodes.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

-- RLS Policies for canvas_edges
CREATE POLICY "Users can view canvas edges they own" ON canvas_edges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_edges.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert canvas edges they own" ON canvas_edges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_edges.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update canvas edges they own" ON canvas_edges
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_edges.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete canvas edges they own" ON canvas_edges
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM canvas_states 
      WHERE canvas_states.id = canvas_edges.canvas_id 
      AND canvas_states.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at (using function created in base_tables migration)
CREATE TRIGGER update_canvas_states_updated_at
  BEFORE UPDATE ON canvas_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_nodes_updated_at
  BEFORE UPDATE ON canvas_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_edges_updated_at
  BEFORE UPDATE ON canvas_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for canvas summary (useful for listing canvases)
CREATE VIEW canvas_summary AS
SELECT 
  cs.id,
  cs.user_id,
  cs.project_id,
  cs.name,
  cs.version,
  cs.created_at,
  cs.updated_at,
  COUNT(DISTINCT cn.id) as node_count,
  COUNT(DISTINCT ce.id) as edge_count,
  COALESCE(
    json_object_agg(
      cn.node_type, 
      type_counts.count
    ) FILTER (WHERE cn.node_type IS NOT NULL), 
    '{}'::json
  ) as node_type_counts
FROM canvas_states cs
LEFT JOIN canvas_nodes cn ON cs.id = cn.canvas_id
LEFT JOIN canvas_edges ce ON cs.id = ce.canvas_id
LEFT JOIN (
  SELECT 
    canvas_id, 
    node_type, 
    COUNT(*) as count
  FROM canvas_nodes 
  GROUP BY canvas_id, node_type
) type_counts ON cs.id = type_counts.canvas_id
GROUP BY cs.id, cs.user_id, cs.project_id, cs.name, cs.version, cs.created_at, cs.updated_at;

-- Enable RLS on the view
ALTER VIEW canvas_summary SET (security_barrier = true);

-- Grant permissions on the view
GRANT SELECT ON canvas_summary TO authenticated;

-- Create function for canvas analytics
CREATE OR REPLACE FUNCTION get_canvas_analytics(canvas_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'node_count', COUNT(DISTINCT cn.id),
    'edge_count', COUNT(DISTINCT ce.id),
    'node_types', COALESCE(
      json_object_agg(cn.node_type, type_counts.count) FILTER (WHERE cn.node_type IS NOT NULL),
      '{}'::json
    ),
    'complexity_score', 
      CASE 
        WHEN COUNT(DISTINCT cn.id) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT ce.id)::DECIMAL / COUNT(DISTINCT cn.id)) * 100, 2)
      END,
    'last_modified', GREATEST(
      COALESCE(MAX(cn.updated_at), cs.updated_at),
      COALESCE(MAX(ce.updated_at), cs.updated_at),
      cs.updated_at
    )
  ) INTO result
  FROM canvas_states cs
  LEFT JOIN canvas_nodes cn ON cs.id = cn.canvas_id
  LEFT JOIN canvas_edges ce ON cs.id = ce.canvas_id
  LEFT JOIN (
    SELECT canvas_id, node_type, COUNT(*) as count
    FROM canvas_nodes 
    GROUP BY canvas_id, node_type
  ) type_counts ON cs.id = type_counts.canvas_id AND cn.node_type = type_counts.node_type
  WHERE cs.id = canvas_uuid
    AND cs.user_id = auth.uid()
  GROUP BY cs.id, cs.user_id, cs.updated_at;
  
  RETURN COALESCE(result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_canvas_analytics(UUID) TO authenticated;

-- Grant permissions on all tables
GRANT ALL ON canvas_states TO authenticated;
GRANT ALL ON canvas_nodes TO authenticated;
GRANT ALL ON canvas_edges TO authenticated;
