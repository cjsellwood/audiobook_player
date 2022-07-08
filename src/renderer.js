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
    const sideBarDetails = document.createElement("div");
    sideBarDetails.id = "sidebarDetails";
    const titleP = document.createElement("h1");
    titleP.textContent = audioBook.title;
    sideBarDetails.append(titleP);
    const artistP = document.createElement("p");
    artistP.textContent = audioBook.artist;
    sideBarDetails.append(artistP);
    // const yearP = document.createElement("p");
    // yearP.textContent = audioBook.year;
    // sideBarDetails.append(yearP);
    // const sizeP = document.createElement("p");
    // sizeP.textContent = Math.round(audioBook.size / 1000000) + " MB";
    // sideBarDetails.append(sizeP);
    sideBarBook.append(sideBarDetails);
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
    sourceElement.addEventListener("error", (e) => {
        console.log(e);
        sideBarBook.replaceChildren();
        sideBarBook.append("File not found");
    });
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
    playButton.id = "playButton";
    const playButtonImage = document.createElement("img");
    playButtonImage.src = "images/play-fill.svg";
    playButtonImage.id = "playImg";
    playButton.append(playButtonImage);
    playButton.addEventListener("click", () => {
        if (!isPlaying) {
            if (count >= audioBook.duration) {
                count = 0;
                audioElement.currentTime = 0;
            }
            audioElement.play();
            isPlaying = true;
            playButtonImage.src = "images/pause-fill.svg";
            interval = setInterval(() => {
                count++;
                // If book finished
                if (count > audioBook.duration) {
                    count = audioBook.duration;
                    timePlayed.textContent = secondsToHms(count);
                    audioBooks[index].time = count;
                    seekBarInner.style.width = (count / audioBook.duration) * 288 + "px";
                    localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
                    clearInterval(interval);
                    audioElement.pause();
                    isPlaying = false;
                    playButton.textContent = "play";
                }
                else {
                    timePlayed.textContent = secondsToHms(count);
                    audioBooks[index].time = count;
                    seekBarInner.style.width = (count / audioBook.duration) * 288 + "px";
                    localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
                }
            }, 1000);
        }
        else {
            isPlaying = false;
            playButtonImage.src = "images/play-fill.svg";
            audioElement.pause();
            clearInterval(interval);
        }
    });
    const back1m = document.createElement("button");
    const back1mImg = document.createElement("img");
    back1mImg.src = "images/forward.svg";
    back1mImg.style.transform = "rotate(180deg)";
    back1m.append(back1mImg);
    const back1mSpan = document.createElement("span");
    back1mSpan.textContent = "1m";
    back1m.append(back1mSpan);
    back1m.addEventListener("click", () => {
        count = count - 60;
        if (count < 0) {
            count = 0;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
    });
    const back10s = document.createElement("button");
    const back10sImg = document.createElement("img");
    back10sImg.src = "images/forward.svg";
    back10sImg.style.transform = "rotate(180deg)";
    back10s.append(back10sImg);
    const back10sSpan = document.createElement("span");
    back10sSpan.textContent = "10s";
    back10s.append(back10sSpan);
    back10s.addEventListener("click", () => {
        count = count - 10;
        if (count < 0) {
            count = 0;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
    });
    const forward10s = document.createElement("button");
    const forwardImg = document.createElement("img");
    forwardImg.src = "images/forward.svg";
    forward10s.append(forwardImg);
    const forwardSpan = document.createElement("span");
    forwardSpan.textContent = "10s";
    forward10s.append(forwardSpan);
    forward10s.addEventListener("click", () => {
        count = count + 10;
        if (count > audioBook.duration) {
            count = audioBook.duration;
        }
        audioElement.currentTime = count;
        timePlayed.textContent = secondsToHms(count);
        audioBooks[index].time = count;
        localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
    });
    const forward1m = document.createElement("button");
    const forward1mImg = document.createElement("img");
    forward1mImg.src = "images/forward.svg";
    forward1m.append(forward1mImg);
    const forward1mSpan = document.createElement("span");
    forward1mSpan.textContent = "1m";
    forward1m.append(forward1mSpan);
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
};
const renderAudioBooks = (audioBooks) => {
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
    const audioBooksList = localStorage.getItem("abList");
    if (!audioBooksList) {
        return;
    }
    for (let i = 0; i < JSON.parse(audioBooksList).length; i++) {
        const audioBook = localStorage.getItem(`ab_${JSON.parse(audioBooksList)[i]}`);
        if (audioBook) {
            audioBooks.push(JSON.parse(audioBook));
        }
    }
    renderAudioBooks(audioBooks);
}));
// Choose directory and load audiobooks from file
fileInput.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
    const loader = document.querySelector(".lds-ring");
    loader.style.display = "flex";
    root.style.overflow = "hidden";
    root.style.height = "100vh";
    const scannedAudioBooks = yield window.electronAPI.openDir();
    root.style.height = "100%";
    if (!scannedAudioBooks) {
        loader.style.display = "none";
        return;
    }
    // Clear sidebar
    selected = -1;
    const sideBarBook = document.getElementById("sidebarBook");
    sideBarBook.replaceChildren();
    // Remove previous audiobooks from local storage
    let audioBooksList = localStorage.getItem("abList");
    if (!audioBooksList) {
        audioBooksList = "[]";
    }
    for (let i = 0; i < JSON.parse(audioBooksList).length; i++) {
        localStorage.removeItem(`ab_${JSON.parse(audioBooksList)[i]}`);
    }
    localStorage.removeItem("abList");
    root.replaceChildren();
    const previousAudiobooks = audioBooks;
    audioBooks = scannedAudioBooks;
    // Get time and set if already in library before scanning
    for (let audioBook of audioBooks) {
        const old = previousAudiobooks.find((x) => x.title === audioBook.title && x.artist === audioBook.artist);
        if (!old) {
            continue;
        }
        if (old.time) {
            audioBook.time = old.time;
        }
    }
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
        localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
    }
    localStorage.setItem("abList", JSON.stringify(audioBooks.map((audiobook) => audiobook.id)));
    root.append(ul);
    loader.style.display = "none";
}));
