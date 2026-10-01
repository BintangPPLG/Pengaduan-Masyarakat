const db = require('./config/db');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

async function testHttp() {
  // Buat token admin
  const [admins] = await db.query("SELECT id, username, role FROM users WHERE role IN ('admin','super_admin') LIMIT 1");
  const admin = admins[0];
  const secret = process.env.JWT_SECRET || 'your_super_secret_key_change_this';
  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    secret,
    { expiresIn: '1h' }
  );

  console.log('Testing as:', admin.username, '/', admin.role);

  // Test /reports/_stats/advanced
  await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/reports/_stats/advanced',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n=== /reports/_stats/advanced ===');
        console.log('Status:', res.statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log('summary:', JSON.stringify(parsed.summary));
          console.log('perDay count:', parsed.perDay?.length);
          console.log('byStatus:', JSON.stringify(parsed.byStatus));
          console.log('byCategory:', JSON.stringify(parsed.byCategory));
        } catch(e) {
          console.log('Raw:', data.substring(0, 200));
        }
        resolve();
      });
    });
    req.on('error', e => { console.log('HTTP error:', e.message); resolve(); });
    req.end();
  });

  // Test /reports/_stats/summary
  await new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/reports/_stats/summary',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n=== /reports/_stats/summary ===');
        console.log('Status:', res.statusCode);
        console.log('Data:', data.substring(0, 300));
        resolve();
      });
    });
    req.on('error', e => { console.log('HTTP error:', e.message); resolve(); });
    req.end();
  });

  process.exit(0);
}

testHttp().catch(e => { console.error(e.message); process.exit(1); });
