const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_pengaduan_simple',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  console.log('Koneksi ke database berhasil.');

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`Menjalankan migrasi: ${file}...`);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await connection.query(sql);
      console.log(`Migrasi ${file} berhasil dijalankan.`);
    } catch (err) {
      console.error(`Gagal menjalankan migrasi ${file}:`, err.message);
    }
  }

  await connection.end();
  console.log('Semua migrasi selesai diproses.');
}

main().catch(err => {
  console.error('Terjadi kesalahan:', err);
});
