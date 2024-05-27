import { app, BrowserWindow } from 'electron'
// import { fileURLToPath } from 'url';
// import path from 'path';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
function createWindow(route = '/') { //creates electron windows
  let win = new BrowserWindow({width: 900,
    height: 700,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
}});
  
  // win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
  win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${route}`);

  
}

app.whenReady().then(() => {
  createWindow('/');
  createWindow('/bms');
  createWindow('/motorController');
});
app.on('window-all-closed', () => {
  app.quit();
})