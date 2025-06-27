/*
  # Master Canvas Feature Schema
  
  1. New Tables
    - `canvas_sessions` - Track Master vs Exploratory canvases
    - `project_canvas_snapshots` - Cache generated canvases
    - `plot_conflicts` - Store detected issues
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Indexes
    - Create indexes for performance optimization
*/

-- Canvas Sessions (track Master vs Exploratory canvases)
CREATE TABLE canvas_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  canvas_type VARCHAR(20) NOT NULL CHECK (canvas_type IN ('master', 'exploratory')),
  canvas_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Canvas Snapshots (cache generated canvases)
CREATE TABLE project_canvas_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  canvas_data JSONB NOT NULL,
  analysis_results JSONB,
  data_hash VARCHAR(64) NOT NULL, -- Hash of source project data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Plot Conflicts (store detected issues)
CREATE TABLE plot_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  conflict_type VARCHAR(20) NOT NULL CHECK (conflict_type IN ('character', 'timeline', 'logic', 'motivation')),
  severity VARCHAR(10) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  description TEXT NOT NULL,
  suggested_fix TEXT,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  chapter_id UUID REFERENCES chapters(id),
  character_id UUID REFERENCES characters(id),
  user_dismissed BOOLEAN DEFAULT FALSE,
  user_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_canvas_sessions_user_project ON canvas_sessions(user_id, project_id);
CREATE INDEX idx_project_canvas_snapshots_project ON project_canvas_snapshots(project_id);
CREATE INDEX idx_project_canvas_snapshots_hash ON project_canvas_snapshots(data_hash);
CREATE INDEX idx_plot_conflicts_project ON plot_conflicts(project_id);
CREATE INDEX idx_plot_conflicts_severity ON plot_conflicts(severity, user_dismissed);

-- Enable Row Level Security
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_canvas_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_conflicts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY canvas_sessions_user_access ON canvas_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY canvas_snapshots_project_access ON project_canvas_snapshots
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY conflicts_user_access ON plot_conflicts
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Create function to analyze project data and detect conflicts
CREATE OR REPLACE FUNCTION analyze_project_conflicts(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  -- Get user ID from auth
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Check if user has access to this project
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Project not found or access denied');
  END IF;
  
  -- In a real implementation, this would perform complex analysis
  -- For now, we'll return a simple success message
  v_result := jsonb_build_object(
    'success', true,
    'conflicts_detected', 0,
    'analysis_timestamp', NOW()
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION analyze_project_conflicts(UUID) TO authenticated;

-- Create function to dismiss a conflict
CREATE OR REPLACE FUNCTION dismiss_conflict(p_conflict_id UUID, p_feedback TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  -- Get user ID from auth
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  -- Check if user has access to this conflict
  IF NOT EXISTS (
    SELECT 1 FROM plot_conflicts pc
    JOIN projects p ON pc.project_id = p.id
    WHERE pc.id = p_conflict_id AND p.user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Conflict not found or access denied');
  END IF;
  
  -- Update conflict as dismissed
  UPDATE plot_conflicts
  SET 
    user_dismissed = TRUE,
    user_feedback = p_feedback
  WHERE id = p_conflict_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'conflict_id', p_conflict_id,
    'dismissed_at', NOW()
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION dismiss_conflict(UUID, TEXT) TO authenticated;