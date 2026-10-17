CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(254) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name varchar(120) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'member'
    CHECK (role IN ('superadmin', 'admin', 'researcher', 'member')),
  account_status varchar(20) NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_role_idx ON users (role);
CREATE INDEX users_account_status_idx ON users (account_status);
