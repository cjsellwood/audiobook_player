type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

type Audiobook = {
  id: string;
  title: string;
  author: string;
  path: string;
  year: string;
  bitrate: number;
  duration: number;
  cover: string;
  size: number;
  time?: number;
  read?: boolean;
};

function secondsToHms(d: number) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h + ":";
  var mDisplay = m.toString().padStart(2, "0") + ":";
  var sDisplay = s.toString().padStart(2, "0");
  return hDisplay + mDisplay + sDisplay;
}

let audioBooks: Audiobook[] = [];
let selected: string = "";
let interval: NodeJS.Timer;
let view: string = "grid";
let sort: string = "path";
let order: string = "asc";

const renderSideBar = (audioBook: Audiobook) => {
  if (audioBook.id === selected) {
    return;
  }
  selected = audioBook.id;
  localStorage.setItem("selected", selected);
  const sideBarBook = document.getElementById("sidebarBook")! as HTMLDivElement;

  sideBarBook.replaceChildren();

  const sideBarDetails = document.createElement("div");
  sideBarDetails.id = "sidebarDetails";

  const titleP = document.createElement("h1");
  titleP.textContent = audioBook.title;
  sideBarDetails.append(titleP);

  const authorP = document.createElement("p");
  authorP.textContent = audioBook.author;
  sideBarDetails.append(authorP);

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

  // Show file not found
  sourceElement.addEventListener("error", (e) => {
    document.getElementById("seekBar")?.remove();
    document.getElementById("timeContainer")?.remove();
    document.getElementById("buttonsContainer")?.remove();
    const notFound = document.createElement("div");
    notFound.id = "notFound";
    const notFoundText = document.createElement("p");
    notFoundText.textContent = "File not found";
    notFound.append(notFoundText);
    sideBarBook.append(notFound);
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
          audioBooks[index].read = true;
          renderAudioBooks();
          localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
          clearInterval(interval);
          audioElement.pause();
          isPlaying = false;
          playButtonImage.src = "images/play-fill.svg";
        } else {
          timePlayed.textContent = secondsToHms(count);
          audioBooks[index].time = count;
          seekBarInner.style.width = (count / audioBook.duration) * 288 + "px";
          localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
        }
      }, 1000);
    } else {
      isPlaying = false;
      playButtonImage.src = "images/play-fill.svg";
      audioElement.pause();
      clearInterval(interval);
    }
  });

  // Audio control buttons
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
    localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
  });
};

const renderGrid = () => {
  const ul = document.createElement("ul");
  ul.classList.add("book-grid");

  for (let audioBook of audioBooks) {
    const li = document.createElement("li");

    const coverImg = document.createElement("img");
    coverImg.src = audioBook.cover;
    coverImg.id = "img" + audioBook.id;

    li.addEventListener("click", () => {
      renderSideBar(audioBook);
    });

    li.append(coverImg);

    const titleP = document.createElement("h1");
    titleP.textContent = audioBook.title;
    li.append(titleP);

    const authorP = document.createElement("p");
    authorP.textContent = audioBook.author;
    li.append(authorP);

    ul.append(li);
  }

  return ul;
};

const renderList = () => {
  const ul = document.createElement("ul");
  ul.classList.add("book-list");

  // Create table list header and add sort buttons
  const top = document.createElement("li");
  const topTitle = document.createElement("p");
  topTitle.textContent = "Title";
  topTitle.addEventListener("click", () => {
    changeSort("title");
  });
  top.append(topTitle);
  const topAuthor = document.createElement("p");
  topAuthor.textContent = "Author";
  topAuthor.addEventListener("click", () => {
    changeSort("author");
  });
  top.append(topAuthor);
  const topRead = document.createElement("p");
  topRead.textContent = "Read";
  topRead.addEventListener("click", () => {
    changeSort("read");
  });
  top.append(topRead);
  const topYear = document.createElement("p");
  topYear.textContent = "Year";
  topYear.addEventListener("click", () => {
    changeSort("year");
  });
  top.append(topYear);
  const topLength = document.createElement("p");
  topLength.textContent = "Length";
  topLength.addEventListener("click", () => {
    changeSort("length");
  });
  top.append(topLength);
  const topSize = document.createElement("p");
  topSize.textContent = "Size";
  topSize.addEventListener("click", () => {
    changeSort("size");
  });
  top.append(topSize);
  const topBitrate = document.createElement("p");
  topBitrate.textContent = "Bitrate";
  topBitrate.addEventListener("click", () => {
    changeSort("bitrate");
  });
  top.append(topBitrate);
  const topPath = document.createElement("p");
  topPath.textContent = "Path";
  topPath.addEventListener("click", () => {
    changeSort("path");
  });
  top.append(topPath);

  top.style.fontWeight = "bold";

  ul.append(top);

  for (let audioBook of audioBooks) {
    const li = document.createElement("li");

    li.addEventListener("click", () => {
      renderSideBar(audioBook);
    });

    const titleP = document.createElement("p");
    titleP.textContent = audioBook.title;
    li.append(titleP);

    const authorP = document.createElement("p");
    authorP.textContent = audioBook.author;
    li.append(authorP);

    const readButton = document.createElement("button");
    readButton.classList.add("readButton");
    const readImg = document.createElement("img");
    readImg.src = audioBook.read
      ? "images/check-circle.svg"
      : "images/x-circle.svg";

    readButton.append(readImg);
    li.append(readButton);

    // Add event listener to change read status
    readButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audioBook.read) {
        audioBook.read = false;
      } else {
        audioBook.read = true;
      }
      localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));

      renderAudioBooks();
    });

    const yearP = document.createElement("p");
    yearP.textContent = audioBook.year;
    li.append(yearP);

    const durationP = document.createElement("p");
    durationP.textContent = secondsToHms(audioBook.duration);
    li.append(durationP);

    const sizeP = document.createElement("p");
    sizeP.textContent = Math.round(audioBook.size / 1000000) + " MB";
    li.append(sizeP);

    const bitrateP = document.createElement("p");
    bitrateP.textContent =
      Math.round(audioBook.bitrate / 1000).toString() + " kbps";
    li.append(bitrateP);

    const pathP = document.createElement("p");
    pathP.textContent = audioBook.path;
    li.append(pathP);

    ul.append(li);
  }
  return ul;
};

const renderAudioBooks = () => {
  root.replaceChildren();

  let ul: HTMLUListElement;
  if (view === "grid") {
    ul = renderGrid();
  } else {
    ul = renderList();
  }

  root.append(ul);
};

const root = document.getElementById("root")! as HTMLDivElement;

// Run upon load of window
window.addEventListener("load", async () => {
  // Load view and sort
  view = localStorage.getItem("view") || view;
  sort = localStorage.getItem("sort") || sort;
  order = localStorage.getItem("order") || order;

  // Load and render previous saved audiobooks from local storage
  const audioBooksList = localStorage.getItem("abList");
  if (!audioBooksList) {
    return;
  }

  for (let i = 0; i < JSON.parse(audioBooksList).length; i++) {
    const audioBook = localStorage.getItem(
      `ab_${JSON.parse(audioBooksList)[i]}`
    );
    if (audioBook) {
      audioBooks.push(JSON.parse(audioBook));
    }
  }

  orderAudiobooks();
  renderAudioBooks();

  // Load sidebar last selected from previous session
  const selectedStored = localStorage.getItem("selected");
  if (!selectedStored) {
    return;
  }

  const sideBarSelected = audioBooks.find((x) => x.id === selectedStored);
  if (sideBarSelected) {
    renderSideBar(sideBarSelected);
  }
});

// Choose directory and load audiobooks from file
const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
fileInput.addEventListener("click", async (e) => {
  const loader = document.querySelector(".lds-ring")! as HTMLDivElement;
  loader.style.display = "flex";
  root.style.overflow = "hidden";
  root.style.height = "100vh";
  const scannedAudioBooks = await (window as any).electronAPI.openDir();

  root.style.height = "100%";
  if (!scannedAudioBooks) {
    loader.style.display = "none";
    return;
  }

  // Clear sidebar
  selected = "";
  const sideBarBook = document.getElementById("sidebarBook")! as HTMLDivElement;
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
  localStorage.removeItem("selected");

  root.replaceChildren();

  const previousAudiobooks = audioBooks;

  audioBooks = scannedAudioBooks;

  // Get time and set if already in library before scanning
  for (let audioBook of audioBooks) {
    const old = previousAudiobooks.find(
      (x) => x.title === audioBook.title && x.author === audioBook.author
    );
    if (!old) {
      continue;
    }
    if (old.time) {
      audioBook.time = old.time;
    }
    if (old.read) {
      audioBook.read = old.read;
    }
  }

  const ul = document.createElement("ul");

  // Add duration for files that don't have it in metadata
  for (let audioBook of audioBooks) {
    if (isNaN(audioBook.duration) || audioBook.duration < 1000) {
      const audioContainer = document.getElementById(
        "audioContainer"
      )! as HTMLDivElement;
      audioContainer.replaceChildren();
      const audioPlayer = document.createElement("audio");
      const source = document.createElement("source");

      source.src = audioBook.path;

      audioPlayer.append(source);
      audioContainer.append(audioPlayer);

      const durationPromise = new Promise((resolve): void => {
        audioPlayer.addEventListener("loadedmetadata", () => {
          audioBook.duration = audioPlayer.duration;
          resolve(1);
        });
      });

      await durationPromise;
    }
  }

  // Fix bit rates from files with NaN bitrate
  for (let audioBook of audioBooks) {
    if (isNaN(audioBook.bitrate) || audioBook.bitrate < 1000) {
      audioBook.bitrate = (audioBook.size / audioBook.duration) * 8;
    }
  }

  renderAudioBooks();

  // Store each individually
  for (let audioBook of audioBooks) {
    localStorage.setItem(`ab_${audioBook.id}`, JSON.stringify(audioBook));
  }
  localStorage.setItem(
    "abList",
    JSON.stringify(audioBooks.map((audiobook) => audiobook.id))
  );

  root.append(ul);

  loader.style.display = "none";
});

// Change audiobook view
const viewButton = document.getElementById("viewButton")! as HTMLButtonElement;
viewButton.addEventListener("click", () => {
  if (view === "grid") {
    view = "list";
  } else {
    view = "grid";
  }

  localStorage.setItem("view", view);

  renderAudioBooks();
});

// Change audiobook sort
const changeSort = (newSort: string) => {
  if (sort === newSort) {
    order = order === "asc" ? "desc" : "asc";
  } else {
    order = "asc";
  }
  sort = newSort;
  localStorage.setItem("sort", sort);
  localStorage.setItem("order", order);

  orderAudiobooks();

  renderAudioBooks();
};

const orderAudiobooks = () => {
  let sortFunction;
  switch (sort) {
    case "title":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.title > b.title) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "author":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.author > b.author) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "read":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if ((a.read || false) <= (b.read || false)) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "year":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.year > b.year) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "length":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.duration > b.duration) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "size":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.size > b.size) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "bitrate":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.bitrate > b.bitrate) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    case "path":
      sortFunction = (a: Audiobook, b: Audiobook): number => {
        if (a.path > b.path) {
          return 1;
        } else {
          return -1;
        }
      };
      break;
    default:
      break;
  }

  audioBooks.sort(sortFunction);
  if (order === "desc") {
    audioBooks.reverse();
  }
};

// Loading count
const counter = document.getElementById("load-count")! as HTMLParagraphElement;
(window as any).electronAPI.onUpdateCounter((e: any, value: string) => {
  counter.textContent = value;
});
