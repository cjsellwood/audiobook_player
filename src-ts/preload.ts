import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openDir: () => ipcRenderer.invoke("dialog:openDir"),
  findFile: () => ipcRenderer.invoke("dialog:findFile"),
  onUpdateCounter: (callback: any) =>
    ipcRenderer.on("update-counter", callback),
});
