import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import * as fs from "node:fs/promises";

// type RecursiveDir = (string | RecursiveDir)[];
type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1480,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  win.loadFile("src/index.html");

  win.showInactive();
  // win.webContents.openDevTools();

  return win;
};

app.whenReady().then(() => {
  const mainWindow = createWindow();

  const expandDirectory = async (dir: string): Promise<(RecursiveDir | string)[]> => {
    console.log(dir);
    const list = await fs.readdir(dir, {
      withFileTypes: true,
    });

    console.log(list);
    const result: (RecursiveDir | string)[] = [];
    for (let i of list) {
      console.log(path.resolve(dir, i.name), i.isDirectory());
      if (i.isDirectory()) {
        const subDir = await expandDirectory(path.resolve(dir, i.name));
        console.log("subDir", subDir);
        result.push({ folder: path.resolve(dir, i.name), children: subDir });
      } else {
        result.push(path.resolve(dir, i.name));
      }
    }
    return result;
  };

  async function handleDirOpen() {
    const input = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    const list = await expandDirectory(input.filePaths[0]);

    console.log(list);

    if (input.canceled) {
      return;
    } else {
      return { input: input.filePaths[0], files: list };
    }
  }

  ipcMain.handle("dialog:openDir", handleDirOpen);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
