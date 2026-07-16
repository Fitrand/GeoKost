-- Migration: Buat tabel password_reset_tokens
-- Jalankan di Supabase SQL Editor atau via psql

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token        TEXT PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk lookup cepat berdasarkan user_id
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
    ON password_reset_tokens(user_id);

-- Auto cleanup token expired (opsional, jalankan periodik)
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW();
