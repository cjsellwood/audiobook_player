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
const root = document.getElementById("root");
fileInput.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    root.append((document.createElement("h1").textContent = "LOADING"));
    const { files, input, audioBooks } = yield window.electronAPI.openDir();
    // console.log(files, input);
    root.replaceChildren();
    const ul = document.createElement("ul");
    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor((d % 3600) / 60);
        var s = Math.floor((d % 3600) % 60);
        var hDisplay = h > 0 ? h + ":" : "";
        var mDisplay = m.toString().padStart(2, "0") + ":";
        var sDisplay = s.toString().padStart(2, "0");
        return hDisplay + mDisplay + sDisplay;
    }
    for (let audioBook of audioBooks) {
        const li = document.createElement("li");
        li.style.display = "grid";
        li.style.gridTemplateColumns = "repeat(7, 1fr)";
        const coverImg = document.createElement("img");
        coverImg.src = URL.createObjectURL(new Blob([audioBook.cover.data], { type: audioBook.cover.format }));
        coverImg.style.width = "200px";
        coverImg.style.height = "200px";
        li.append(coverImg);
        const titleP = document.createElement("p");
        titleP.textContent = audioBook.title;
        li.append(titleP);
        const artistP = document.createElement("p");
        artistP.textContent = audioBook.artist;
        li.append(artistP);
        const yearP = document.createElement("p");
        yearP.textContent = audioBook.year;
        li.append(yearP);
        const pathP = document.createElement("p");
        pathP.textContent = audioBook.path;
        li.append(pathP);
        const durationP = document.createElement("p");
        durationP.textContent = secondsToHms(audioBook.duration);
        li.append(durationP);
        const bitrateP = document.createElement("p");
        bitrateP.textContent = Math.round(audioBook.bitrate / 1000).toString();
        li.append(bitrateP);
        ul.append(li);
    }
    root.append(ul);
    const title = document.createElement("h3");
    title.textContent = input;
    root.append(title);
    const addListItem = (fileArray, parentElement, folderName) => {
        const elementList = document.createElement("div");
        const re = new RegExp(`${folderName.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}/`, "g");
        for (let i = 0; i < fileArray.length; i++) {
            if (typeof fileArray[i] === "string") {
                const fileElement = document.createElement("p");
                fileElement.textContent =
                    "📄 " + fileArray[i].replace(re, "");
                elementList.append(fileElement);
            }
            else {
                const folderP = document.createElement("p");
                folderP.textContent =
                    "📁 " + fileArray[i].folder.replace(re, "");
                elementList.append(folderP);
                addListItem(fileArray[i].children, elementList, fileArray[i].folder);
            }
        }
        parentElement.append(elementList);
    };
    console.log(audioBooks);
    addListItem(files, root, input);
}));
