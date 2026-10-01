-- =============================================================
-- MIGRATION 002: MULTI-IMAGE SUPPORT
-- Run once on db_pengaduan_simple
-- =============================================================

-- Tambah kolom images (JSON array of paths) di public_reports
-- Kolom image lama tetap ada untuk backward-compatibility
ALTER TABLE public_reports
  ADD COLUMN IF NOT EXISTS images JSON NULL DEFAULT NULL;

-- Migrasi data lama: pindahkan nilai kolom image -> images sebagai array 1 elemen
UPDATE public_reports
  SET images = JSON_ARRAY(image)
  WHERE image IS NOT NULL AND images IS NULL;

-- =============================================================
-- SELESAI — kolom image lama dibiarkan (tidak dihapus)
-- =============================================================
