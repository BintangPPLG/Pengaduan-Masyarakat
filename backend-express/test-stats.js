const db = require('./config/db');
require('dotenv').config();

async function test() {
  const [admins] = await db.query("SELECT id, username, role FROM users WHERE role IN ('admin','super_admin') LIMIT 1");
  if (!admins.length) { console.log('NO ADMIN FOUND'); process.exit(1); }
  const admin = admins[0];
  console.log('Admin found:', admin.username, admin.role);

  const [[today]] = await db.query('SELECT COUNT(*) AS count FROM public_reports WHERE DATE(created_at) = CURDATE()');
  const [[total]] = await db.query('SELECT COUNT(*) AS count FROM public_reports');
  const [perDay] = await db.query('SELECT DATE(created_at) AS date, COUNT(*) AS count FROM public_reports WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) GROUP BY DATE(created_at) ORDER BY date ASC');
  const [byCategory] = await db.query('SELECT c.category_name AS name, COUNT(pr.id) AS count FROM categories c LEFT JOIN public_reports pr ON pr.category_id = c.id GROUP BY c.id, c.category_name ORDER BY count DESC');
  const [byStatus] = await db.query('SELECT status AS name, COUNT(*) AS count FROM public_reports GROUP BY status');

  console.log('Total laporan:', total.count);
  console.log('Today:', today.count);
  console.log('perDay rows:', perDay.length);
  console.log('byCategory:', JSON.stringify(byCategory));
  console.log('byStatus:', JSON.stringify(byStatus));

  // Cek ada data di public_reports
  const [sample] = await db.query('SELECT id, header, body, status FROM public_reports LIMIT 3');
  console.log('Sample reports:', JSON.stringify(sample, null, 2));

  process.exit(0);
}
test().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
