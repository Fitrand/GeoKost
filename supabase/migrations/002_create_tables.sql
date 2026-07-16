-- =============================================
-- Migration 002: Tabel Kampus
-- =============================================

CREATE TABLE IF NOT EXISTS kampus (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama        VARCHAR(255) NOT NULL,
    singkatan   VARCHAR(20),
    kota        VARCHAR(100),
    provinsi    VARCHAR(100),
    alamat      TEXT,
    koordinat   GEOMETRY(POINT, 4326) NOT NULL,
    logo_url    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks spasial GIST untuk performa query ST_DWithin
CREATE INDEX IF NOT EXISTS idx_kampus_koordinat ON kampus USING GIST(koordinat);
CREATE INDEX IF NOT EXISTS idx_kampus_kota ON kampus(kota);

-- =============================================
-- Migration 002: Tabel Kost
-- =============================================

CREATE TABLE IF NOT EXISTS kost (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pemilik_id        UUID,  -- References Supabase auth.users(id)
    nama              VARCHAR(255) NOT NULL,
    deskripsi         TEXT,
    harga_per_bulan   INTEGER NOT NULL CHECK (harga_per_bulan > 0),
    luas_m2           SMALLINT CHECK (luas_m2 > 0),
    tipe_kamar        VARCHAR(50) CHECK (tipe_kamar IN ('single', 'double', 'campur', 'putra', 'putri')),
    koordinat         GEOMETRY(POINT, 4326) NOT NULL,
    alamat            TEXT,
    fasilitas         TEXT[] DEFAULT '{}',
    foto_urls         TEXT[] DEFAULT '{}',
    rating            SMALLINT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    jumlah_ulasan     INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks spasial untuk kueri radius
CREATE INDEX IF NOT EXISTS idx_kost_koordinat ON kost USING GIST(koordinat);
CREATE INDEX IF NOT EXISTS idx_kost_harga ON kost(harga_per_bulan);
CREATE INDEX IF NOT EXISTS idx_kost_is_active ON kost(is_active);
CREATE INDEX IF NOT EXISTS idx_kost_tipe ON kost(tipe_kamar);
CREATE INDEX IF NOT EXISTS idx_kost_pemilik ON kost(pemilik_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kost_updated_at
    BEFORE UPDATE ON kost
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security (RLS) - Pemilik kost
-- =============================================

ALTER TABLE kost ENABLE ROW LEVEL SECURITY;

-- Semua orang bisa READ kost aktif
CREATE POLICY "kost_select_active" ON kost
    FOR SELECT USING (is_active = TRUE);

-- Hanya pemilik yang bisa INSERT/UPDATE/DELETE kost mereka
CREATE POLICY "kost_insert_own" ON kost
    FOR INSERT WITH CHECK (auth.uid() = pemilik_id);

CREATE POLICY "kost_update_own" ON kost
    FOR UPDATE USING (auth.uid() = pemilik_id);

CREATE POLICY "kost_delete_own" ON kost
    FOR DELETE USING (auth.uid() = pemilik_id);
