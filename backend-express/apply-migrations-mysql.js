const mysql = require('mysql2/promise');
require('dotenv').config();

async function tableExists(connection, dbName, tableName) {
  const [rows] = await connection.query(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [dbName, tableName]
  );
  return rows.length > 0;
}

async function columnExists(connection, dbName, tableName, columnName) {
  const [rows] = await connection.query(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [dbName, tableName, columnName]
  );
  return rows.length > 0;
}

async function indexExists(connection, dbName, tableName, indexName) {
  const [rows] = await connection.query(
    'SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?',
    [dbName, tableName, indexName]
  );
  return rows.length > 0;
}

async function main() {
  const dbName = process.env.DB_NAME || 'db_pengaduan_simple';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    port: process.env.DB_PORT || 3306,
  });

  console.log('Koneksi ke database berhasil.');

  // 1. ALTER TABLE comments ADD COLUMN parent_id
  if (!(await columnExists(connection, dbName, 'comments', 'parent_id'))) {
    console.log('Menambahkan kolom parent_id ke comments...');
    await connection.query('ALTER TABLE comments ADD COLUMN parent_id INT NULL DEFAULT NULL');
  }

  // 2. ALTER TABLE comments ADD COLUMN updated_at
  if (!(await columnExists(connection, dbName, 'comments', 'updated_at'))) {
    console.log('Menambahkan kolom updated_at ke comments...');
    await connection.query('ALTER TABLE comments ADD COLUMN updated_at DATETIME NULL');
  }

  // 3. Add foreign key fk_comments_parent if parent_id exists
  try {
    console.log('Menambahkan constraint fk_comments_parent ke comments...');
    await connection.query(
      'ALTER TABLE comments ADD CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE'
    );
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME' || err.message.includes('Duplicate key name') || err.message.includes('already exists')) {
      console.log('Constraint fk_comments_parent sudah ada.');
    } else {
      console.error('Gagal menambahkan constraint:', err.message);
    }
  }

  // 4. CREATE TABLE notifications
  if (!(await tableExists(connection, dbName, 'notifications'))) {
    console.log('Membuat tabel notifications...');
    await connection.query(`
      CREATE TABLE notifications (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        user_id      INT         NOT NULL,
        type         VARCHAR(50) NOT NULL,
        title        VARCHAR(255) NOT NULL,
        message      TEXT        NOT NULL,
        reference_id INT         NULL,
        is_read      TINYINT(1)  NOT NULL DEFAULT 0,
        created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  // 5. CREATE INDEX idx_notif_user
  if (!(await indexExists(connection, dbName, 'notifications', 'idx_notif_user'))) {
    console.log('Membuat indeks idx_notif_user...');
    await connection.query('CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at)');
  }

  // 6. CREATE TABLE ratings
  if (!(await tableExists(connection, dbName, 'ratings'))) {
    console.log('Membuat tabel ratings...');
    await connection.query(`
      CREATE TABLE ratings (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        report_id  INT      NOT NULL UNIQUE,
        user_id    INT      NOT NULL,
        rating     TINYINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review     TEXT     NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NULL,
        FOREIGN KEY (report_id) REFERENCES public_reports(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }

  // 7. CREATE TABLE audit_logs
  if (!(await tableExists(connection, dbName, 'audit_logs'))) {
    console.log('Membuat tabel audit_logs...');
    await connection.query(`
      CREATE TABLE audit_logs (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT         NULL,
        username   VARCHAR(50) NOT NULL,
        role       VARCHAR(20) NOT NULL,
        action     VARCHAR(100) NOT NULL,
        detail     TEXT        NULL,
        ip_address VARCHAR(45) NULL,
        created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // 8. CREATE INDEX idx_audit_created
  if (!(await indexExists(connection, dbName, 'audit_logs', 'idx_audit_created'))) {
    console.log('Membuat indeks idx_audit_created...');
    await connection.query('CREATE INDEX idx_audit_created ON audit_logs(created_at DESC)');
  }

  // 9. CREATE INDEX idx_audit_user
  if (!(await indexExists(connection, dbName, 'audit_logs', 'idx_audit_user'))) {
    console.log('Membuat indeks idx_audit_user...');
    await connection.query('CREATE INDEX idx_audit_user ON audit_logs(user_id)');
  }

  // 10. ALTER TABLE public_reports ADD COLUMN images
  if (!(await columnExists(connection, dbName, 'public_reports', 'images'))) {
    console.log('Menambahkan kolom images ke public_reports...');
    await connection.query('ALTER TABLE public_reports ADD COLUMN images JSON NULL DEFAULT NULL');
  }

  // 11. Migrate old image column to images JSON array
  console.log('Memindahkan data gambar lama ke format JSON...');
  await connection.query(`
    UPDATE public_reports
    SET images = JSON_ARRAY(image)
    WHERE image IS NOT NULL AND images IS NULL
  `);

  console.log('Semua migrasi sukses dijalankan!');
  await connection.end();
}

main().catch(err => {
  console.error('Terjadi kesalahan:', err);
});
