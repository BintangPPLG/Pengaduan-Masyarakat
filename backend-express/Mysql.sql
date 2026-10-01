-- =============================================================
-- DATABASE SCHEMA: db_pengaduan_simple (Aplikasi SuaraWarga / AAS)
-- Backend API Express JS + MySQL
-- =============================================================

CREATE DATABASE IF NOT EXISTS db_pengaduan_simple;
USE db_pengaduan_simple;

-- =========================
-- 1. USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin','super_admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. CATEGORIES
-- =========================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- =========================
-- 3. PUBLIC REPORTS (LAPORAN)
-- =========================
CREATE TABLE IF NOT EXISTS public_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    header VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    image VARCHAR(255) NULL,
    images JSON NULL DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    rejected_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =========================
-- 4. COMMENTS & REPLIES
-- =========================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_report_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    parent_id INT NULL DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,

    FOREIGN KEY (public_report_id) REFERENCES public_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- =========================
-- 5. NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id INT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 6. RATINGS
-- =========================
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    FOREIGN KEY (report_id) REFERENCES public_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- 7. AUDIT LOGS
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    detail TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- SEED DATA (Default Accounts)
-- Password bcrypt saltRounds=10
-- super_admin → password: 123
-- admin       → password: admin123
-- user biasa  → password: user123
-- =========================

INSERT IGNORE INTO users (id, username, email, password, role) VALUES
(1, 'superadmin', 'superadmin@gmail.com', '$2b$10$IY0Ym.g8lVT4qMCoBmjBduW0DTwbpuabUEIIaKECeSRqZJEAApQmS', 'super_admin'),
(2, 'admin1',     'admin@gmail.com',      '$2b$10$xVkQkgB/9GkUkrbeyEJIsOeCFZszAZVrhm6uSIOwx22fyJBFLOlT2', 'admin'),
(3, 'budi',       'budi@gmail.com',       '$2b$10$ouUPROE0wgrYH5fcnmEQQOs6ZDxWktwl14DPAwSkbkS.sAoIveOci', 'user');

INSERT IGNORE INTO categories (id, category_name) VALUES
(1, 'Infrastruktur'),
(2, 'Kebersihan'),
(3, 'Keamanan'),
(4, 'Pelayanan Publik'),
(5, 'Lainnya');
