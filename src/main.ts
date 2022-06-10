import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import * as fs from "node:fs/promises";
import jsmediatags from "jsmediatags";
import * as mm from "music-metadata";
import util from "util";

// type RecursiveDir = (string | RecursiveDir)[];
type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1480,
    height: 820,
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

  let audioBooks: any[] = [];
  console.log(audioBooks, "audiobooks");

  const expandDirectory = async (
    dir: string
  ): Promise<(RecursiveDir | string)[]> => {
    const list = await fs.readdir(dir, {
      withFileTypes: true,
    });

    const result: (RecursiveDir | string)[] = [];
    for (let i of list) {
      if (i.isDirectory()) {
        await expandDirectory(path.resolve(dir, i.name));
      } else {
        result.push(path.resolve(dir, i.name));
        if (/(.mp3|.m4b|.m4a)$/.test(i.name)) {
          audioBooks.push(path.resolve(dir, i.name));
        }
      }
    }
    return result;
  };

  const getMetadata = async (file: string) => {
    try {
      const metadata = await mm.parseFile(file);
      return metadata;
    } catch (error: any) {
      console.error(error.message);
      return error.message;
    }
  };

  async function handleDirOpen() {
    const input = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (input.canceled) {
      return;
    }

    await expandDirectory(input.filePaths[0]);

    const audioBooksData = [];

    await fs.rm("images", { recursive: true, force: true });
    await fs.mkdir("images");

    console.log("AB", audioBooks);

    for (let i = 0; i < audioBooks.length; i++) {
      const metadata = await getMetadata(audioBooks[i]);
      let imageFile = "images/default";
      console.log(metadata.common);
      if (metadata.common.picture) {
        imageFile = `images/img${i}${metadata.common.picture[0].format.replace(
          "image/",
          "."
        )}`;
        await fs.writeFile(imageFile, metadata.common.picture[0].data);
      }

      const stats = await fs.stat(audioBooks[i]);
      console.log(metadata.common, metadata.format);

      audioBooksData.push({
        id: i,
        path: audioBooks[i],
        artist: metadata.common?.artist,
        year: metadata.common?.year,
        title: metadata.common?.title,
        bitrate: metadata.format?.bitrate,
        duration: metadata.format?.duration,
        cover: path.resolve(imageFile),
        size: stats.size,
      });
    }

    return audioBooksData;
  }

  ipcMain.handle("dialog:openDir", handleDirOpen);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
