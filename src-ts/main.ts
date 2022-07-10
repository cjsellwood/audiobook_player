import { app, BrowserWindow, dialog, ipcMain, nativeImage } from "electron";
import path from "path";
import * as fs from "node:fs/promises";
import * as mm from "music-metadata";
import { handleSquirrelEvent } from "./squirrel";
import { v4 as uuidv4 } from "uuid";

if (handleSquirrelEvent(app)) {
  // @ts-ignore
  return;
}

// type RecursiveDir = (string | RecursiveDir)[];
type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

const createWindow = () => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "images/icon.png")
  );
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    icon: icon,
  });

  win.loadFile("src/index.html");

  win.showInactive();
  // win.webContents.openDevTools();

  return win;
};

app.whenReady().then(() => {
  const mainWindow = createWindow();

  let audioBooks: any[] = [];

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

    audioBooks = [];

    await expandDirectory(input.filePaths[0]);

    const audioBooksData = [];

    await fs.rm(app.getPath("userData") + "/images", {
      recursive: true,
      force: true,
    });
    await fs.mkdir(app.getPath("userData") + "/images");

    for (let i = 0; i < audioBooks.length; i++) {
      console.log(i, audioBooks[i]);
      const metadata = await getMetadata(audioBooks[i]);
      console.log("got metadata");
      let imageFile = app.getPath("userData") + "/images/default.jpeg";
      const id = uuidv4();
      if (metadata.common.picture) {
        imageFile = `${app.getPath(
          "userData"
        )}/images/${id}${metadata.common.picture[0].format.replace(
          "image/",
          "."
        )}`;
        await fs.writeFile(imageFile, metadata.common.picture[0].data);
      }
      console.log("wrote image")

      const stats = await fs.stat(audioBooks[i]);
      console.log("got stats")

      audioBooksData.push({
        id: id,
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
