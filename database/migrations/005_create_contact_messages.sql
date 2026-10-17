CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name varchar(120) NOT NULL,
  email varchar(254) NOT NULL,
  subject varchar(180) NOT NULL,
  message text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  assigned_to uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_status_idx ON contact_messages (status);
CREATE INDEX contact_messages_created_at_idx
  ON contact_messages (created_at DESC);
