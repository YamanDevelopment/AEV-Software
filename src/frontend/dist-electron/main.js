import { app as e, BrowserWindow as r } from "electron";
let i;
function a(o = "/", t, n) {
  new r({
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
  }).loadURL(`http://localhost:5151/#${o}`);
}
e.whenReady().then(() => {
  a("/", "main", "../assets/dashboard.ico"), a("/cameras", "cameras", "/cameras.ico");
});
e.on("window-all-closed", () => {
  i.kill(), e.quit();
});
