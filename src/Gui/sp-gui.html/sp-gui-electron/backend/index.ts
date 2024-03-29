import { app, BrowserWindow } from 'electron';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: !app.isPackaged,
    thickFrame: true,
    maximizable: true,
    acceptFirstMouse: true,
    fullscreenable: true,
    icon: "app/favicon.ico",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // const mnu = new Menu();
  // mnu.append(
  //   new MenuItem({
  //     label: "File",
  //   })
  // );
  // mainWindow.setMenu(mnu);

  // and load the index.html of the app.
  // if (!app.isPackaged) {
  //   mainWindow.loadURL("https://localhost:4200");
  //   mainWindow.webContents.openDevTools();
  // } else {
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  // }
  mainWindow.maximize();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
