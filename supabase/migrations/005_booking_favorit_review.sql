-- ============================================================
-- Migration 005: Tabel Booking, Favorit, Review
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ── 0. PASTIKAN FUNGSI updated_at ADA (idempotent) ──────────
-- Fungsi ini mungkin sudah ada dari migration sebelumnya,
-- CREATE OR REPLACE memastikan aman dijalankan ulang.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. UPDATE TABEL USERS: Tambah field profil ──────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS no_telepon  VARCHAR(20),
  ADD COLUMN IF NOT EXISTS kampus      VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prodi       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS angkatan    VARCHAR(10);


-- ── 2. TABEL BOOKING ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kost_id         UUID NOT NULL REFERENCES kost(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'selesai')),
    durasi_bulan    SMALLINT NOT NULL CHECK (durasi_bulan > 0),
    tanggal_masuk   DATE NOT NULL,
    total_harga     INTEGER NOT NULL CHECK (total_harga > 0),
    catatan         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_booking_user_id  ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_kost_id  ON booking(kost_id);
CREATE INDEX IF NOT EXISTS idx_booking_status   ON booking(status);

-- Auto-update updated_at untuk booking
CREATE TRIGGER trigger_booking_updated_at
    BEFORE UPDATE ON booking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS untuk booking: validasi di level FastAPI, nonaktifkan RLS
-- (konsisten dengan arsitektur custom JWT yang sudah ada)
ALTER TABLE booking DISABLE ROW LEVEL SECURITY;


-- ── 3. TABEL FAVORIT ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorit (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kost_id     UUID NOT NULL REFERENCES kost(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, kost_id)  -- Satu kost hanya bisa difavoritkan 1x per user
);

CREATE INDEX IF NOT EXISTS idx_favorit_user_id ON favorit(user_id);
CREATE INDEX IF NOT EXISTS idx_favorit_kost_id ON favorit(kost_id);

ALTER TABLE favorit DISABLE ROW LEVEL SECURITY;


-- ── 4. TABEL REVIEW ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kost_id     UUID NOT NULL REFERENCES kost(id)  ON DELETE CASCADE,
    booking_id  UUID REFERENCES booking(id) ON DELETE SET NULL,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    komentar    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, kost_id)  -- Satu user hanya bisa review 1x per kost
);

CREATE INDEX IF NOT EXISTS idx_review_kost_id ON review(kost_id);
CREATE INDEX IF NOT EXISTS idx_review_user_id ON review(user_id);

ALTER TABLE review DISABLE ROW LEVEL SECURITY;


-- ── 5. TRIGGER: Auto-update rating & jumlah_ulasan di tabel kost ──
CREATE OR REPLACE FUNCTION recalculate_kost_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Hitung ulang setelah INSERT atau DELETE di tabel review
    UPDATE kost
    SET
        rating        = COALESCE((SELECT ROUND(AVG(rating))::SMALLINT FROM review WHERE kost_id = COALESCE(NEW.kost_id, OLD.kost_id)), 0),
        jumlah_ulasan = (SELECT COUNT(*) FROM review WHERE kost_id = COALESCE(NEW.kost_id, OLD.kost_id)),
        updated_at    = NOW()
    WHERE id = COALESCE(NEW.kost_id, OLD.kost_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel review
DROP TRIGGER IF EXISTS trigger_review_update_rating ON review;
CREATE TRIGGER trigger_review_update_rating
    AFTER INSERT OR DELETE ON review
    FOR EACH ROW EXECUTE FUNCTION recalculate_kost_rating();
