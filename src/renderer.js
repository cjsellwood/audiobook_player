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
    console.log(files, input);
    const root = document.getElementById("root");
    root.replaceChildren();
    const title = document.createElement("h3");
    title.textContent = input;
    root.append(title);
    const addListItem = (fileArray, parentElement, folderName) => {
        const elementList = document.createElement("div");
        for (let i = 0; i < fileArray.length; i++) {
            if (typeof fileArray[i] === "string") {
                const fileElement = document.createElement("p");
                fileElement.textContent =
                    "📄 " +
                        fileArray[i].replace(new RegExp(`${folderName}/`, "g"), "");
                elementList.append(fileElement);
            }
            else {
                const folderP = document.createElement("p");
                // elementList.append(
                //   "📁 " +
                //     (fileArray[i] as RecursiveDir).folder.replace(
                //       new RegExp(`${folderName}/`, "g"),
                //       ""
                //     )
                // );
                folderP.textContent =
                    "📁 " +
                        fileArray[i].folder.replace(new RegExp(`${folderName}/`, "g"), "");
                elementList.append(folderP);
                addListItem(fileArray[i].children, elementList, fileArray[i].folder);
            }
        }
        parentElement.append(elementList);
    };
    addListItem(files, root, input);
}));
