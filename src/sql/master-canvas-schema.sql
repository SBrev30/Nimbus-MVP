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

-- Row Level Security
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_canvas_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_conflicts ENABLE ROW LEVEL SECURITY;

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
