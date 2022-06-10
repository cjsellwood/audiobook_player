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
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);
    var hDisplay = h + ":";
    var mDisplay = m.toString().padStart(2, "0") + ":";
    var sDisplay = s.toString().padStart(2, "0");
    return hDisplay + mDisplay + sDisplay;
}
let audioBooks = [];
let selected = -1;
let interval;
const renderSideBar = (audioBook) => {
    if (audioBook.id === selected) {
        return;
    }
    selected = audioBook.id;
    const sideBarBook = document.getElementById("sidebarBook");
    sideBarBook.replaceChildren();
    const imageContainer = document.createElement("div");
    imageContainer.id = "imageContainer";
    const coverImg = document.createElement("img");
    coverImg.src = audioBook.cover;
    coverImg.id = "img" + audioBook.id;
    imageContainer.append(coverImg);
    sideBarBook.append(imageContainer);
    // Add media player
    const audioElement = document.createElement("audio");
    audioElement.currentTime = audioBook.time || 0;
    const sourceElement = document.createElement("source");
    audioElement.id = "player";
    sourceElement.src = audioBook.path;
    audioElement.append(sourceElement);
    sideBarBook.append(audioElement);
    // Seek bar
    const seekBar = document.createElement("div");
    seekBar.id = "seekBar";
    const seekBarInner = document.createElement("div");
    seekBarInner.id = "seekBarInner";
    const width = ((audioBook.time || 0) / audioBook.duration) * 288;
    seekBarInner.style.width = width + "px";
    seekBar.append(seekBarInner);
    sideBarBook.append(seekBar);
    const timePlayed = document.createElement("p");
    timePlayed.textContent = secondsToHms(audioBook.time || 0);
    const totalTime = document.createElement("p");
    totalTime.textContent = secondsToHms(audioBook.duration);
    const timeContainer = document.createElement("div");
    timeContainer.id = "timeContainer";
    timeContainer.append(timePlayed);
    timeContainer.append(totalTime);
    sideBarBook.append(timeContainer);
    // Audio buttons
    let count = audioBook.time || 0;
    clearInterval(interval);
    const playButton = document.createElement("button");
    const index = audioBooks.findIndex((x) => audioBook.id === x.id);
    let isPlaying = false;
    playButton.textContent = "play";
    playButton.id = "playButton";
    playButton.addEventListener("click", () => {
        if (!isPlaying) {
            if (count >= audioBook.duration) {
                count = 0;
                audioElement.currentTime = 0;
            }
            audioElement.play();
            isPlaying = true;
            playButton.textContent = "pause";
            interval = setInterval(() => {
                count++;
                // If book finished
                if (count > audioBook.duration) {
                    count = audioBook.duration;
                    timePlayed.textContent = secondsToHms(count);
                    audioBooks[index].time = count;
                    seekBarInner.style.width = (count / audioBook.duration) * 288 + "px";
                    localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
                    clearInterval(interval);
                    audioElement.pause();
                    isPlaying = false;
                    playButton.textContent = "play";
                }
                else {
                    timePlayed.textContent = secondsToHms(count);
                    audioBooks[index].time = count;
                    seekBarInner.style.width = (count / audioBook.duration) * 288 + "px";
                    localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
                }
            }, 1000);
        }
        else {
            isPlaying = false;
            playButton.textContent = "play";
            audioElement.pause();
            clearInterval(interval);
        }
    });
    const back1m = document.createElement("button");
    back1m.textContent = "- 1m";
    back1m.addEventListener("click", () => {
        count = count - 60;
        if (count < 0) {
            count = 0;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    });
    const back10s = document.createElement("button");
    back10s.textContent = "- 10s";
    back10s.addEventListener("click", () => {
        count = count - 10;
        if (count < 0) {
            count = 0;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    });
    const forward10s = document.createElement("button");
    forward10s.textContent = "+ 10s";
    forward10s.addEventListener("click", () => {
        count = count + 10;
        if (count > audioBook.duration) {
            count = audioBook.duration;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    });
    const forward1m = document.createElement("button");
    forward1m.textContent = "+ 1m";
    forward1m.addEventListener("click", () => {
        count = count + 60;
        if (count > audioBook.duration) {
            count = audioBook.duration;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    });
    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "buttonsContainer";
    buttonsContainer.append(back1m);
    buttonsContainer.append(back10s);
    buttonsContainer.append(playButton);
    buttonsContainer.append(forward10s);
    buttonsContainer.append(forward1m);
    sideBarBook.append(buttonsContainer);
    // Go to different time on seek bar
    seekBar.addEventListener("click", (e) => {
        const clickLocation = e.x - 6;
        seekBarInner.style.width = 288 * (clickLocation / 288) + "px";
        count = audioBook.duration * (clickLocation / 288);
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    });
    const titleP = document.createElement("h1");
    titleP.textContent = audioBook.title;
    sideBarBook.append(titleP);
    const artistP = document.createElement("p");
    artistP.textContent = audioBook.artist;
    sideBarBook.append(artistP);
    const yearP = document.createElement("p");
    yearP.textContent = audioBook.year;
    sideBarBook.append(yearP);
    const sizeP = document.createElement("p");
    sizeP.textContent = Math.round(audioBook.size / 1000000) + " MB";
    sideBarBook.append(sizeP);
};
const renderAudioBooks = (audioBooks) => {
    console.log(audioBooks);
    root.replaceChildren();
    const ul = document.createElement("ul");
    ul.classList.add("book-grid");
    for (let audioBook of audioBooks) {
        const li = document.createElement("li");
        const coverImg = document.createElement("img");
        coverImg.src = audioBook.cover;
        coverImg.id = "img" + audioBook.id;
        coverImg.addEventListener("click", () => {
            renderSideBar(audioBook);
        });
        li.append(coverImg);
        const titleP = document.createElement("h1");
        titleP.textContent = audioBook.title;
        li.append(titleP);
        const artistP = document.createElement("p");
        artistP.textContent = audioBook.artist;
        li.append(artistP);
        // const yearP = document.createElement("p");
        // yearP.textContent = audioBook.year;
        // li.append(yearP);
        // const pathP = document.createElement("p");
        // pathP.textContent = audioBook.path;
        // li.append(pathP);
        // const durationP = document.createElement("p");
        // durationP.textContent = secondsToHms(audioBook.duration);
        // li.append(durationP);
        // const sizeP = document.createElement("p");
        // sizeP.textContent = Math.round(audioBook.size / 1000000) + " MB";
        // li.append(sizeP);
        // const bitrateP = document.createElement("p");
        // bitrateP.textContent = Math.round(audioBook.bitrate / 1000).toString();
        // li.append(bitrateP);
        ul.append(li);
    }
    root.append(ul);
};
const fileInput = document.getElementById("folderPicker");
const root = document.getElementById("root");
// Load and render previous saved audiobooks from local storage
window.addEventListener("load", () => __awaiter(void 0, void 0, void 0, function* () {
    const audioBooksLength = localStorage.getItem("abLength");
    if (!audioBooksLength) {
        return;
    }
    for (let i = 0; i < +audioBooksLength; i++) {
        const audioBook = localStorage.getItem(`ab${i}`);
        if (audioBook) {
            audioBooks.push(JSON.parse(audioBook));
        }
    }
    renderAudioBooks(audioBooks);
    // console.log(storedAudioBooks);
}));
// Choose directory and load audiobooks from file
fileInput.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    root.replaceChildren();
    root.append((document.createElement("h1").textContent = "LOADING"));
    const loader = document.querySelector(".lds-ring");
    loader.style.display = "flex";
    const { files, input, audioBooks: scannedAudioBooks, } = yield window.electronAPI.openDir();
    audioBooks = scannedAudioBooks;
    const ul = document.createElement("ul");
    // Add duration for files that don't have it in metadata
    for (let audioBook of audioBooks) {
        if (isNaN(audioBook.duration)) {
            const audioContainer = document.getElementById("audioContainer");
            audioContainer.replaceChildren();
            const audioPlayer = document.createElement("audio");
            const source = document.createElement("source");
            source.src = audioBook.path;
            audioPlayer.append(source);
            audioContainer.append(audioPlayer);
            const durationPromise = new Promise((resolve) => {
                audioPlayer.addEventListener("loadedmetadata", () => {
                    audioBook.duration = audioPlayer.duration;
                    resolve(1);
                });
            });
            yield durationPromise;
        }
    }
    // Fix bit rates from files with NaN bitrate
    for (let audioBook of audioBooks) {
        if (isNaN(audioBook.bitrate)) {
            audioBook.bitrate = (audioBook.size / audioBook.duration) * 8;
        }
    }
    renderAudioBooks(audioBooks);
    // Store each individually
    for (let audioBook of audioBooks) {
        localStorage.setItem(`ab${audioBook.id}`, JSON.stringify(audioBook));
    }
    localStorage.setItem("abLength", audioBooks.length.toString());
    root.append(ul);
    loader.style.display = "none";
    // const title = document.createElement("h3");
    // title.textContent = input;
    // root.append(title);
    // const addListItem = (
    //   fileArray: (RecursiveDir | string)[],
    //   parentElement: HTMLDivElement,
    //   folderName: string
    // ) => {
    //   const elementList = document.createElement("div");
    //   const re = new RegExp(
    //     `${folderName.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}/`,
    //     "g"
    //   );
    //   for (let i = 0; i < fileArray.length; i++) {
    //     if (typeof fileArray[i] === "string") {
    //       const fileElement = document.createElement("p");
    //       fileElement.textContent =
    //         "📄 " + (fileArray[i] as string).replace(re, "");
    //       elementList.append(fileElement);
    //     } else {
    //       const folderP = document.createElement("p");
    //       folderP.textContent =
    //         "📁 " + (fileArray[i] as RecursiveDir).folder.replace(re, "");
    //       elementList.append(folderP);
    //       addListItem(
    //         (fileArray[i] as RecursiveDir).children as (RecursiveDir | string)[],
    //         elementList,
    //         (fileArray[i] as RecursiveDir).folder
    //       );
    //     }
    //   }
    //   parentElement.append(elementList);
    // };
    // addListItem(files, root, input);
}));
