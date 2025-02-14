import { app, BrowserWindow } from 'electron'
import {spawn, ChildProcess} from 'child_process';

// import { fileURLToPath } from 'url';
// import path from 'path';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
let backendProcess: ChildProcess;
function createWindow(route = '/', title: string, icon: any) { //creates electron windows
  let win = new BrowserWindow({
    width: 1420,
    height: 900,
    title: title,
    icon: icon,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        preload: 'preload.js'
    },
    autoHideMenuBar: true
  });
  
  // win.loadURL(`file://${path.join(__dirname, '/react/build/index.html')}#${route}`);
  win.loadURL(`http://localhost:5151/#${route}`);  
}


app.whenReady().then(() => {
// const ls = spawn('node', ['../serialport/index.js']);

// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// ls.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// });

// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// }); 
createWindow('/debug', 'debug', '/debug.ico');
createWindow('/cameras', 'cameras', '/cameras.ico');
createWindow('/', 'main', '../assets/dashboard.ico');
//   createWindow('/#/debug', 'aev-debug', '../assets/dashboard.ico');
});
app.on('window-all-closed', () => {
  backendProcess.kill();
  app.quit();
});
