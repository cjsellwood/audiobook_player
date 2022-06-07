"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fileInput = document.getElementById("folderPicker");
fileInput.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    const { files, input } = yield window.electronAPI.openDir();
    console.log(files);
    const root = document.getElementById("root");
    const addListItem = (fileArray, parentElement) => {
        const elementList = document.createElement("div");
        for (let file of fileArray) {
            if (typeof file === "string") {
                const fileElement = document.createElement("div");
                fileElement.textContent = file.replace(new RegExp(`${input}/`, "g"), "");
                elementList.append(fileElement);
            }
            else {
                console.log(file);
                addListItem(file, elementList);
            }
        }
        parentElement.append(elementList);
    };
    addListItem(files, root);
}));
