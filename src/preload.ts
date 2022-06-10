import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openDir: () => ipcRenderer.invoke("dialog:openDir"),
});