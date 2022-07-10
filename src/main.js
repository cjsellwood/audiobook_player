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
const squirrel_1 = require("./squirrel");
const uuid_1 = require("uuid");
if ((0, squirrel_1.handleSquirrelEvent)(electron_1.app)) {
    // @ts-ignore
    return;
}
const createWindow = () => {
    const icon = electron_1.nativeImage.createFromPath(path_1.default.join(__dirname, "images/icon.png"));
    const win = new electron_1.BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
        },
        show: false,
        icon: icon,
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
        const list = yield fs.readdir(dir, {
            withFileTypes: true,
        });
        const result = [];
        for (let i of list) {
            if (i.isDirectory()) {
                yield expandDirectory(path_1.default.resolve(dir, i.name));
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
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const input = yield electron_1.dialog.showOpenDialog({
                properties: ["openDirectory"],
            });
            if (input.canceled) {
                return;
            }
            audioBooks = [];
            yield expandDirectory(input.filePaths[0]);
            const audioBooksData = [];
            yield fs.rm(electron_1.app.getPath("userData") + "/images", {
                recursive: true,
                force: true,
            });
            yield fs.mkdir(electron_1.app.getPath("userData") + "/images");
            for (let i = 0; i < audioBooks.length; i++) {
                console.log(i, audioBooks[i]);
                const metadata = yield getMetadata(audioBooks[i]);
                console.log("got metadata");
                let imageFile = electron_1.app.getPath("userData") + "/images/default.jpeg";
                const id = (0, uuid_1.v4)();
                if (metadata.common.picture) {
                    imageFile = `${electron_1.app.getPath("userData")}/images/${id}${metadata.common.picture[0].format.replace("image/", ".")}`;
                    yield fs.writeFile(imageFile, metadata.common.picture[0].data);
                }
                console.log("wrote image");
                const stats = yield fs.stat(audioBooks[i]);
                console.log("got stats");
                audioBooksData.push({
                    id: id,
                    path: audioBooks[i],
                    artist: (_a = metadata.common) === null || _a === void 0 ? void 0 : _a.artist,
                    year: (_b = metadata.common) === null || _b === void 0 ? void 0 : _b.year,
                    title: (_c = metadata.common) === null || _c === void 0 ? void 0 : _c.title,
                    bitrate: (_d = metadata.format) === null || _d === void 0 ? void 0 : _d.bitrate,
                    duration: (_e = metadata.format) === null || _e === void 0 ? void 0 : _e.duration,
                    cover: path_1.default.resolve(imageFile),
                    size: stats.size,
                });
            }
            return audioBooksData;
        });
    }
    electron_1.ipcMain.handle("dialog:openDir", handleDirOpen);
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
