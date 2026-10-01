/**
 * generate-hash.js
 * Script untuk generate bcrypt hash dari password plaintext.
 * Jalankan: node generate-hash.js
 * Salin output hash ke dalam SQL / phpMyAdmin.
 */

const bcrypt = require('bcrypt');

const passwords = [
  { label: 'super_admin (password: 123)',     plain: '123' },
  { label: 'admin      (password: admin123)', plain: 'admin123' },
  { label: 'user       (password: user123)',  plain: 'user123' },
];

async function generateHashes() {
  console.log('\n========== BCRYPT HASH GENERATOR ==========\n');

  for (const item of passwords) {
    const hash = await bcrypt.hash(item.plain, 10);
    console.log(`[${item.label}]`);
    console.log(`  Plaintext : ${item.plain}`);
    console.log(`  Hash      : ${hash}`);
    console.log('');
  }

  console.log('===========================================');
  console.log('Salin hash di atas ke kolom password di MySQL.\n');
}

generateHashes();
