import { BrowserWindow, app } from "electron";
import path from "path";

function createWindow() {
  console.log("create win");
  // Crea la finestra del browser
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false,
    thickFrame: true,
    maximizable: true,
    acceptFirstMouse: true,
    fullscreenable: true,
    icon: "app/favicon.ico",
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "bridge", "preload.js"),
    },
  });
  //  const mnu = new Electron.Menu();
  //  mnu.append(
  //    new Electron.MenuItem({
  //      label: "File",
  //    })
  //  );
  //  win.setMenu(mnu);
  win.maximize();
  if (!app.isPackaged) win.webContents.openDevTools();
  const startPage = app.isPackaged
    ? () => win.loadFile("app/index.html")
    : () => win.loadURL("http://localhost:4200");

  win.webContents.on("did-fail-load", () => {
    startPage();
  });

  // e carica l'index.html dell'app.
  startPage();

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
