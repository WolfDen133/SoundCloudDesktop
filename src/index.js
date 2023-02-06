const { app, BrowserWindow, ipcMain, BrowserView, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let view;
let secondary;

let width = 1024, height = 720;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        minWidth: width,
        frame: false,

        // The lines below solved the issue
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html')

    mainWindow.setTitle("SoundCloud")

    mainWindow.setMenu(null);

    mainWindow.setThumbarButtons([
        {
            icon: path.join(__dirname, "assets", "taskbar", "previous.png"),
            click () { view.webContents.executeJavaScript("document.getElementsByClassName(\"playControls__prev\")[0].click();") }
        },
        {
            icon: path.join(__dirname, "assets", "taskbar", "play-pause.png"),
            click () { view.webContents.executeJavaScript("document.getElementsByClassName(\"playControls__play\")[0].click();") }
        },
        {
            icon: path.join(__dirname, "assets", "taskbar", "next.png"),
            click () { view.webContents.executeJavaScript("document.getElementsByClassName(\"playControls__next\")[0].click();") }
        }
    ])

    mainWindow.show();

    mainWindow.loadFile(path.join(__dirname, "public", "index.html"))
}

app.on('ready', () => {
    createWindow();

    globalShortcut.register("F6", () => {
        mainWindow.webContents.session.clearStorageData({ storages: "cookies"});
        view.webContents.reload();
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on("window-action", (event, args) => {
    switch (args) {
        case "minimise":
            mainWindow.minimize();
            break;
        case "maximise":
            if (!mainWindow.isMaximized()) { mainWindow.maximize(); }
            else { mainWindow.unmaximize(); }
            break;
        case "close":
            mainWindow.hide();
            app.quit();
            break;
    }
})

ipcMain.on("web-action", (event, args) => {
    if (args === 'load') {
        view = new BrowserView();
        view.webContents.loadURL("https://soundcloud.com/");
        mainWindow.setBrowserView(view);
        view.setBounds({x: 0, y: 32, width: width, height: height - 32})
        view.setAutoResize({width: true, height: true});
    }
})


app.on("browser-window-created", (event, window) => {
    if (BrowserWindow.getAllWindows().length > 2) {
        window.close();
        secondary.flashFrame(true)
        return;
    }
    window.setMenu(null);
    window.setTitle("SoundCloud | Loading");
    window.setIcon(path.join(__dirname, "assets", "favicon.ico"))

    secondary = window;
})

