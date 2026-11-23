import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("dlp", {
  openPlatform: (platform: string) => {
    ipcRenderer.send("open-platform", platform);
  },
});