-- ========================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL)
-- SUKUN QUALITY CONTROL — SISTEM PENDATAAN KERUSAKAN ROKOK
-- PT. SUKUN WARTONO INDONESIA
-- ========================================================

-- 1. Tabel Utama: produksi
CREATE TABLE IF NOT EXISTS produksi (
  id BIGSERIAL PRIMARY KEY,
  "YEAR" INTEGER NOT NULL,
  "MONTH" VARCHAR(50) NOT NULL,
  "MONTH_NUMBER" INTEGER NOT NULL,
  "TANGGAL" DATE NOT NULL,
  "HARI" VARCHAR(50) DEFAULT '',
  "JAM_WIB" VARCHAR(50) DEFAULT '',
  "NAMA" VARCHAR(255) NOT NULL,
  "LOKAL" VARCHAR(100) NOT NULL,
  "ABSENSI" VARCHAR(50) DEFAULT 'Hadir',
  "GARAPAN" NUMERIC DEFAULT 0,
  "CW" NUMERIC DEFAULT 0,  -- Cowong
  "PK" NUMERIC DEFAULT 0,  -- Papir Kusut
  "LK" NUMERIC DEFAULT 0,  -- Lem Kurang
  "TK" NUMERIC DEFAULT 0,  -- Talipan Kotor
  "MT" NUMERIC DEFAULT 0,  -- Muntir
  "MD" NUMERIC DEFAULT 0,  -- Medot
  "AT" NUMERIC DEFAULT 0,  -- Atos
  "MM" NUMERIC DEFAULT 0,  -- Mekar Mingkup
  "KERUSAKAN_TELAK" NUMERIC DEFAULT 0,
  "KERUSAKAN_MANDOR" NUMERIC DEFAULT 0,
  "KEKURANGAN_PAPIR" NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query filter
CREATE INDEX IF NOT EXISTS idx_produksi_tanggal ON produksi("TANGGAL");
CREATE INDEX IF NOT EXISTS idx_produksi_nama ON produksi("NAMA");
CREATE INDEX IF NOT EXISTS idx_produksi_lokal ON produksi("LOKAL");
CREATE INDEX IF NOT EXISTS idx_produksi_year_month ON produksi("YEAR", "MONTH_NUMBER");

-- 2. Tabel Master Referensi (Nama Telak & Lokal)
CREATE TABLE IF NOT EXISTS referensi (
  id BIGSERIAL PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL, -- 'NAMA_TELAK' atau 'LOKAL'
  nilai VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Log Aktivitas
CREATE TABLE IF NOT EXISTS log_aktivitas (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  aksi VARCHAR(50) NOT NULL,
  keterangan TEXT NOT NULL
);

-- 4. Enable Row Level Security (RLS) - Izinkan Read/Write Publik untuk Web App QC
ALTER TABLE produksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE referensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on produksi" ON produksi
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all on referensi" ON referensi
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all on log_aktivitas" ON log_aktivitas
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Data Awal Referensi Default
INSERT INTO referensi (kategori, nilai) VALUES
  ('NAMA_TELAK', 'Siti Aminah'),
  ('NAMA_TELAK', 'Sri Wahyuni'),
  ('NAMA_TELAK', 'Suparti'),
  ('NAMA_TELAK', 'Ngatemi'),
  ('NAMA_TELAK', 'Rukmini'),
  ('LOKAL', 'Lokal 1'),
  ('LOKAL', 'Lokal 2'),
  ('LOKAL', 'Lokal 3'),
  ('LOKAL', 'Lokal A'),
  ('LOKAL', 'Lokal B')
ON CONFLICT (nilai) DO NOTHING;
