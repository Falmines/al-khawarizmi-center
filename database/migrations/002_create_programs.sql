CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(100) NOT NULL UNIQUE,
  title varchar(180) NOT NULL,
  description text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX programs_status_idx ON programs (status);

INSERT INTO programs (slug, title, description, status)
VALUES
  ('livein', 'Riset Lapangan', 'Melakukan kajian kebutuhan, pengumpulan data, dan analisis secara etis sebagai dasar perumusan solusi.', 'published'),
  ('kerjabakti', 'Pengabdian Masyarakat', 'Menghubungkan hasil penelitian dengan program pemberdayaan dan kolaborasi bersama masyarakat.', 'published'),
  ('kids', 'Edukasi & Literasi', 'Mengadakan pembelajaran, pelatihan, dan literasi untuk memperluas akses pengetahuan.', 'published'),
  ('baksos', 'Kolaborasi Inovasi', 'Memfasilitasi dialog, riset kolaboratif, dan kesepakatan untuk mengembangkan solusi yang bermanfaat.', 'published');
