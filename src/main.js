"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("node:fs/promises"));
const mm = __importStar(require("music-metadata"));
const createWindow = () => {
    const win = new electron_1.BrowserWindow({
        width: 1480,
        height: 820,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
        },
        show: false,
    });
    win.loadFile("src/index.html");
    win.showInactive();
    // win.webContents.openDevTools();
    return win;
};
electron_1.app.whenReady().then(() => {
    const mainWindow = createWindow();
    let audioBooks = [];
    const expandDirectory = (dir) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log(dir);
        const list = yield fs.readdir(dir, {
            withFileTypes: true,
        });
        // console.log(list);
        const result = [];
        for (let i of list) {
            // console.log(path.resolve(dir, i.name), i.isDirectory());
            if (i.isDirectory()) {
                const subDir = yield expandDirectory(path_1.default.resolve(dir, i.name));
                // console.log("subDir", subDir);
                result.push({ folder: path_1.default.resolve(dir, i.name), children: subDir });
            }
            else {
                result.push(path_1.default.resolve(dir, i.name));
                if (/(.mp3|.m4b|.m4a)$/.test(i.name)) {
                    audioBooks.push(path_1.default.resolve(dir, i.name));
                }
            }
        }
        return result;
    });
    const getMetadata = (file) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const metadata = yield mm.parseFile(file);
            return metadata;
        }
        catch (error) {
            console.error(error.message);
            return error.message;
        }
    });
    function handleDirOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = yield electron_1.dialog.showOpenDialog(mainWindow, {
                properties: ["openDirectory"],
            });
            const list = yield expandDirectory(input.filePaths[0]);
            const audioBooksData = [];
            yield fs.rm("images", { recursive: true, force: true });
            yield fs.mkdir("images");
            for (let i = 0; i < audioBooks.length; i++) {
                const metadata = yield getMetadata(audioBooks[i]);
                const imageFile = `images/img${i}${metadata.common.picture[0].format.replace("image/", ".")}`;
                yield fs.writeFile(imageFile, metadata.common.picture[0].data);
                const stats = yield fs.stat(audioBooks[i]);
                audioBooksData.push({
                    id: i,
                    path: audioBooks[i],
                    artist: metadata.common.artist,
                    year: metadata.common.year,
                    title: metadata.common.title,
                    bitrate: metadata.format.bitrate,
                    duration: metadata.format.duration,
                    cover: path_1.default.resolve(imageFile),
                    size: stats.size,
                });
            }
            if (input.canceled) {
                return;
            }
            else {
                return {
                    input: input.filePaths[0],
                    files: list,
                    audioBooks: audioBooksData,
                };
            }
        });
    }
    electron_1.ipcMain.handle("dialog:openDir", handleDirOpen);
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
