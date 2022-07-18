"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    openDir: () => electron_1.ipcRenderer.invoke("dialog:openDir"),
    findFile: () => electron_1.ipcRenderer.invoke("dialog:findFile"),
    onUpdateCounter: (callback) => electron_1.ipcRenderer.on("update-counter", callback),
});
