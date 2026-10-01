-- =============================================================
-- MIGRATION 001: NEW FEATURES
-- Run once on db_pengaduan_simple
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ALTER comments: tambah parent_id & updated_at (backward-compatible)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS parent_id INT NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

-- Setelah kolom ditambahkan, baru tambah FK (jalankan terpisah jika error)
ALTER TABLE comments
  ADD CONSTRAINT fk_comments_parent
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- 2. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT         NOT NULL,
  type         VARCHAR(50) NOT NULL,   -- 'report_created','report_approved','report_rejected','report_completed','comment_new','comment_reply','admin_reply'
  title        VARCHAR(255) NOT NULL,
  message      TEXT        NOT NULL,
  reference_id INT         NULL,       -- report_id atau comment_id yang dirujuk
  is_read      TINYINT(1)  NOT NULL DEFAULT 0,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at);

-- ─────────────────────────────────────────────────────────────
-- 3. RATINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  report_id  INT      NOT NULL UNIQUE,   -- satu laporan satu rating
  user_id    INT      NOT NULL,
  rating     TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review     TEXT     NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (report_id) REFERENCES public_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- 4. AUDIT LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT         NULL,                -- NULL jika anonymous
  username   VARCHAR(50) NOT NULL,
  role       VARCHAR(20) NOT NULL,
  action     VARCHAR(100) NOT NULL,           -- 'login','logout','create_report','update_status',etc
  detail     TEXT        NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user    ON audit_logs(user_id);

-- ─────────────────────────────────────────────────────────────
-- SELESAI — semua tabel lama tidak diubah/dihapus
-- ─────────────────────────────────────────────────────────────
