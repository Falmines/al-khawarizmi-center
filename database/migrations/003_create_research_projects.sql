CREATE TABLE research_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(120) NOT NULL UNIQUE,
  title varchar(200) NOT NULL,
  summary varchar(500) NOT NULL,
  description text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  lead_researcher_id uuid REFERENCES users (id) ON DELETE SET NULL,
  published_at timestamptz,
  created_by uuid REFERENCES users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX research_projects_status_idx ON research_projects (status);
CREATE INDEX research_projects_lead_researcher_idx
  ON research_projects (lead_researcher_id);
