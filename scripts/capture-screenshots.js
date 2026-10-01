const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:5173/',
  ]);

  console.log('Chrome process spawned...');
  await sleep(2500);

  try {
    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const verData = await verRes.json();
    console.log('Connected to Chrome:', verData.Browser);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');

    if (!pageTarget) {
      throw new Error('No page target found');
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    console.log('Taking screenshot of landing hero...');
    await send('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(2000);

    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '01-landing-hero.png'), Buffer.from(ss1.data, 'base64'));
    console.log('Saved 01-landing-hero.png');

    console.log('Scrolling to landing features...');
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 780, behavior: "instant" })' });
    await sleep(1000);
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '02-landing-features.png'), Buffer.from(ss2.data, 'base64'));
    console.log('Saved 02-landing-features.png');

    console.log('Taking screenshot of login page...');
    await send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(1500);
    const ss3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '03-auth-login.png'), Buffer.from(ss3.data, 'base64'));
    console.log('Saved 03-auth-login.png');

    // Get Auth token for budi (warga)
    console.log('Logging in as citizen (budi)...');
    const loginRes = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'budi@gmail.com', password: 'user123' }),
    });
    const loginData = await loginRes.json();

    if (loginData.token) {
      console.log('Setting auth state for dashboard...');
      await send('Page.navigate', { url: 'http://localhost:5173/' });
      await sleep(1000);

      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('token', '${loginData.token}');
          localStorage.setItem('user', JSON.stringify(${JSON.stringify(loginData.user)}));
        `,
      });

      console.log('Taking screenshot of dashboard warga...');
      await send('Page.navigate', { url: 'http://localhost:5173/dashboard' });
      await sleep(2500);
      const ss4 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(screenshotsDir, '04-dashboard-warga.png'), Buffer.from(ss4.data, 'base64'));
      console.log('Saved 04-dashboard-warga.png');

      console.log('Taking screenshot of add report page (with Leaflet)...');
      await send('Page.navigate', { url: 'http://localhost:5173/laporan/baru' });
      await sleep(2500);
      const ss5 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(screenshotsDir, '05-laporan-baru.png'), Buffer.from(ss5.data, 'base64'));
      console.log('Saved 05-laporan-baru.png');

      console.log('Taking screenshot of report detail page (with Leaflet & discussion)...');
      // Fetch report list to find a valid report ID
      const repRes = await fetch('http://localhost:3000/reports', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const repList = await repRes.json();
      if (Array.isArray(repList) && repList.length > 0) {
        const reportId = repList[0].id;
        await send('Page.navigate', { url: `http://localhost:5173/laporan/${reportId}` });
        await sleep(2500);
        const ss6 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(screenshotsDir, '06-detail-laporan.png'), Buffer.from(ss6.data, 'base64'));
        console.log('Saved 06-detail-laporan.png');
      }
    }

    // Login as admin
    console.log('Logging in as admin (admin1)...');
    const adminLoginRes = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();

    if (adminLoginData.token) {
      console.log('Setting auth state for admin moderasi...');
      await send('Runtime.evaluate', {
        expression: `
          localStorage.setItem('token', '${adminLoginData.token}');
          localStorage.setItem('user', JSON.stringify(${JSON.stringify(adminLoginData.user)}));
        `,
      });

      console.log('Taking screenshot of admin moderasi...');
      await send('Page.navigate', { url: 'http://localhost:5173/admin/moderasi' });
      await sleep(2500);
      const ss7 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(screenshotsDir, '07-admin-moderasi.png'), Buffer.from(ss7.data, 'base64'));
      console.log('Saved 07-admin-moderasi.png');
    }

    ws.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    chrome.kill();
    console.log('Capture process finished.');
  }
}

run();
