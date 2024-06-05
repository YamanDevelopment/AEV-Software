import { app as n, BrowserWindow as t } from "electron";
function e(o = "/") {
  new t({
    width: 700,
    height: 900,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    autoHideMenuBar: !0,
    icon: "../public/favicon.ico"
  }).loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${o}`);
}
n.whenReady().then(() => {
  e("/"), e("/bms"), e("/betterImpl");
});
n.on("window-all-closed", () => {
  n.quit();
});