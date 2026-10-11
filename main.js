const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

// คีย์ฝังมากับแอป (สร้างจาก GitHub Secret ตอนบิลด์) ถ้าผู้ใช้ไม่ได้ใส่คีย์เอง
let EMB = '';
try { EMB = String(require('./config.json').key || ''); } catch (e) {}

// ดึงข้อมูลจาก football-data.org ในตัวแอปโดยตรง จึงไม่โดนเบราว์เซอร์บล็อก
ipcMain.handle('api', async (_e, apiPath, key) => {
  try {
    if (typeof apiPath !== 'string' || !apiPath.startsWith('/competitions/')) return { status: 400, body: '{}' };
    const r = await fetch('https://api.football-data.org/v4' + apiPath, { headers: { 'X-Auth-Token': String(key || EMB) } });
    return { status: r.status, body: await r.text() };
  } catch (e) {
    return { status: 502, body: JSON.stringify({ error: String(e.message || e) }) };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1100, height: 820, backgroundColor: '#010a03', title: 'Football score',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile('Football-score.html');
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { app.quit(); });
