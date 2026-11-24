import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { spawn } from "child_process";
import { PDFParse } from "pdf-parse";

ipcMain.handle("check-sensitive-content", async (_event, text: string) => {
    const isSensitive = text.includes("WALLED_SENSITIVE");

    if (!isSensitive) {
        return true;
    }

    const result = await dialog.showMessageBox({
        type: "warning",
        title: "Sensitive Content Detected",
        message: "Sensitive content was detected in your prompt.",
        detail: `Detected marker: WALLED_SENSITIVE\n\nPrompt:\n${text}`,
        buttons: ["Continue", "Cancel"],
        defaultId: 1,
        cancelId: 1,
    });

    return result.response === 0;
});

// Image OCR scanning
ipcMain.handle("scan-image-ocr", async (_event, imageData: Uint8Array) => {
    return new Promise((resolve) => {
        const tesseract = spawn("tesseract", ["stdin", "stdout"]);

        let extractedText = "";
        let errorText = "";

        tesseract.stdout.on("data", (data) => {
            extractedText += data.toString();
        });

        tesseract.stderr.on("data", (data) => {
            errorText += data.toString();
        });

        tesseract.on("error", (error) => {
            console.error("Failed to start Tesseract:", error);

            resolve({
                success: false,
                extractedText: "",
                detected: false,
            });
        });

        tesseract.on("close", (code) => {
            if (code !== 0) {
                console.error("Tesseract exited with error:", errorText);

                resolve({
                    success: false,
                    extractedText: "",
                    detected: false,
                });

                return;
            }

            extractedText = extractedText.trim();

            resolve({
                success: true,
                extractedText,
                detected: extractedText.includes("WALLED_SENSITIVE"),
            });
        });

        tesseract.stdin.write(Buffer.from(imageData));
        tesseract.stdin.end();
    });
});

// PDF text extraction and DLP scanning
ipcMain.handle("scan-pdf", async (_event, pdfData: Uint8Array) => {
    let parser: PDFParse | undefined;

    try {
        parser = new PDFParse({
            data: Buffer.from(pdfData),
        });

        const result = await parser.getText();
        const extractedText = result.text.trim();

        return {
            success: true,
            extractedText,
            detected: extractedText.includes("WALLED_SENSITIVE"),
        };
    } catch (error) {
        console.error("PDF scanning failed:", error);

        return {
            success: false,
            extractedText: "",
            detected: false,
        };
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
});

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
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    browserWindow.webContents.openDevTools();

    browserWindow.loadURL(url);
});

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