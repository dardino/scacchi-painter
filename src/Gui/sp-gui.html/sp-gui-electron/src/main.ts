import Electron, { BrowserWindow, app } from "electron";
import path from "path";

function createWindow() {
  console.log("create win");
  // Crea la finestra del browser
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false,
    // thickFrame: true,
    maximizable: true,
    acceptFirstMouse: true,
    fullscreenable: true,
    icon: "app/favicon.ico",
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setMenu(new Electron.Menu());
  win.maximize();
  if (process.env.NODE_ENV === "development") win.webContents.openDevTools();

  // e carica l'index.html dell'app.
  win.loadFile("app/index.html");

  win.show();
}

app.allowRendererProcessReuse = true;
app.whenReady().then(createWindow);
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // Su macOS è comune che l'applicazione e la barra menù
  // restano attive finché l'utente non esce espressamente tramite i tasti Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // Su macOS è comune ri-creare la finestra dell'app quando
  // viene cliccata l'icona sul dock e non ci sono altre finestre aperte.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. Si può anche mettere il codice in file separati e richiederlo qui.
