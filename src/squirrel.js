"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSquirrelEvent = void 0;
const node_fs_1 = require("node:fs");
function handleSquirrelEvent(app) {
    if (process.argv.length === 1) {
        return false;
    }
    const ChildProcess = require("child_process");
    const path = require("path");
    const appFolder = path.resolve(process.execPath, "..");
    const rootAtomFolder = path.resolve(appFolder, "..");
    const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
    const exeName = path.basename(process.execPath);
    const spawn = function (command, args) {
        let spawnedProcess, error;
        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        }
        catch (error) { }
        return spawnedProcess;
    };
    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case "--squirrel-install":
        case "--squirrel-updated":
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus
            // Install desktop and start menu shortcuts
            spawnUpdate(["--createShortcut", exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case "--squirrel-uninstall":
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers
            // Remove desktop and start menu shortcuts
            spawnUpdate(["--removeShortcut", exeName]);
            (0, node_fs_1.rmSync)(app.getPath("home") + `\\AppData\\Local\\audiobook_player`, {
                recursive: true,
                force: true,
            });
            (0, node_fs_1.rmSync)(app.getPath("home") + `\\AppData\\Roaming\\audiobook_player`, {
                recursive: true,
                force: true,
            });
            setTimeout(app.quit, 1000);
            return true;
        case "--squirrel-obsolete":
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;
    }
}
exports.handleSquirrelEvent = handleSquirrelEvent;
