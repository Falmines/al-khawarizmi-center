CREATE TABLE partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name varchar(180) NOT NULL,
  contact_name varchar(120) NOT NULL,
  contact_email varchar(254) NOT NULL,
  partnership_type varchar(80) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'declined', 'completed')),
  notes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX partnerships_status_idx ON partnerships (status);
CREATE INDEX partnerships_created_at_idx ON partnerships (created_at DESC);
