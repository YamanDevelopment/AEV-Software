import { app as o, BrowserWindow as t } from "electron";
function e(n = "/") {
  new t({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }).loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${n}`);
}
o.whenReady().then(() => {
  e("/"), e("/bms"), e("/motorController");
});
o.on("window-all-closed", () => {
  o.quit();
});