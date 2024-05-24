import {app, BrowserWindow} from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
// global variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function createWindow(route = '/') { //creates electron windows
        let win = new BrowserWindow({width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
          }
        });
        win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
    }
    

app.whenReady().then(() => {
    createWindow('/car');
    createWindow('/bms');
  });
  app.on('window-all-closed', () => {
    app.quit();
  })