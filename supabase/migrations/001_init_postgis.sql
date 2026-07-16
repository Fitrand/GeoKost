-- =============================================
-- Migration 001: Inisialisasi PostGIS Extension
-- Jalankan via Supabase SQL Editor atau psql
-- =============================================

-- Aktifkan PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Konfirmasi
SELECT postgis_version();
