import { app as o, BrowserWindow as i } from "electron";
let r;
function e(a = "/", t, n) {
  new i({
    width: 1420,
    height: 900,
    title: t,
    icon: n,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1,
      preload: "preload.js"
    },
    autoHideMenuBar: !0
  }).loadURL(`http://localhost:5151/#${a}`);
}
o.whenReady().then(() => {
  e("/debug", "debug", "/debug.ico"), e("/cameras", "cameras", "/cameras.ico"), e("/", "main", "../assets/dashboard.ico");
});
o.on("window-all-closed", () => {
  r.kill(), o.quit();
});
