-- ============================================================
-- Migration 004: Tambah dimensi luas kamar & Supabase Storage
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom dimensi kamar ke tabel kost
ALTER TABLE kost
  ADD COLUMN IF NOT EXISTS luas_panjang SMALLINT,
  ADD COLUMN IF NOT EXISTS luas_lebar   SMALLINT;

-- 2. Buat bucket Storage untuk foto kost (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kost-photos', 'kost-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Hapus policy lama jika ada (aman untuk dijalankan ulang)
DROP POLICY IF EXISTS "Public read kost photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload kost photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own kost photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to kost-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all deletes from kost-photos" ON storage.objects;

-- 4. Policy: siapa saja bisa READ foto (public bucket)
CREATE POLICY "Public read kost photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kost-photos');

-- 5. Policy: izinkan upload dari semua role
--    (anon & authenticated) karena autentikasi dikelola custom JWT FastAPI,
--    bukan Supabase Auth — sehingga auth.role() selalu 'anon'
CREATE POLICY "Allow all uploads to kost-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kost-photos');

-- 6. Policy: izinkan delete dari semua role
CREATE POLICY "Allow all deletes from kost-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'kost-photos');
