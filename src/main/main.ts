<<<<<<< HEAD
import { app, BrowserWindow, ipcMain } from "electron";
=======
import { app, BrowserWindow } from "electron";
>>>>>>> origin/main
import path from "path";

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(
        path.join(__dirname, "../../src/renderer/index.html")
    );
}

<<<<<<< HEAD
ipcMain.on("open-platform", (_event, platform: string) => {
    let url = "";

    if (platform === "chatgpt") {
        url = "https://chatgpt.com";
    } else if (platform === "perplexity") {
        url = "https://www.perplexity.ai";
    }

    if (!url) return;

    const browserWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    browserWindow.loadURL(url);
});

=======
>>>>>>> origin/main
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});