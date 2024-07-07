import { app as a, BrowserWindow as n } from "electron";
let s;
function e(o = "/", r, t) {
  new n({
    width: 1420,
    height: 900,
    title: r,
    icon: t,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1,
      preload: "preload.js"
    },
    autoHideMenuBar: !0
  }).loadURL(`http://localhost:5151/#${o}`);
}
a.whenReady().then(() => {
  e("/", "main", "../assets/dashboard.ico"), e("/cameras", "cameras", "/cameras.ico"), e("/cameras", "cameras", "/cameras.ico");
});
a.on("window-all-closed", () => {
  s.kill(), a.quit();
});
