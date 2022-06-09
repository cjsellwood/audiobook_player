type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

function secondsToHms(d: number) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + ":" : "";
  var mDisplay = m.toString().padStart(2, "0") + ":";
  var sDisplay = s.toString().padStart(2, "0");
  return hDisplay + mDisplay + sDisplay;
}

const renderAudioBooks = (audioBooks: any) => {
  root.replaceChildren();

  const ul = document.createElement("ul");

  for (let audioBook of audioBooks) {
    const li = document.createElement("li");
    li.style.display = "grid";
    li.style.gridTemplateColumns = "2fr 2fr 2fr 1fr 2fr 1fr 1fr 1fr";

    const coverImg = document.createElement("img");
    coverImg.src = audioBook.cover;
    coverImg.style.width = "200px";
    coverImg.style.height = "200px";
    coverImg.id = "img" + audioBook.id;

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

    const sizeP = document.createElement("p");
    sizeP.textContent = Math.round(audioBook.size / 1000000) + " MB";
    li.append(sizeP);

    const bitrateP = document.createElement("p");
    bitrateP.textContent = Math.round(audioBook.bitrate / 1000).toString();
    li.append(bitrateP);

    ul.append(li);
  }

  root.append(ul);
};

const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
const root = document.getElementById("root")! as HTMLDivElement;

let audioBooks = [];

window.addEventListener("load", async () => {
  const storedAudioBooks = localStorage.getItem("audioBooks");
  if (!storedAudioBooks) {
    return;
  }

  audioBooks = JSON.parse(storedAudioBooks);

  renderAudioBooks(audioBooks);

  // console.log(storedAudioBooks);
});

fileInput.addEventListener("click", async (e) => {
  root.replaceChildren();
  root.append((document.createElement("h1").textContent = "LOADING"));
  const loader = document.querySelector(".lds-ring")! as HTMLDivElement;
  loader.style.display = "flex";
  const {
    files,
    input,
    audioBooks: scannedAudioBooks,
  } = await (window as any).electronAPI.openDir();

  audioBooks = scannedAudioBooks;

  const ul = document.createElement("ul");

  // Add duration for files that don't have it in metadata
  for (let audioBook of audioBooks) {
    if (isNaN(audioBook.duration)) {
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
    if (isNaN(audioBook.bitrate)) {
      audioBook.bitrate = (audioBook.size / audioBook.duration) * 8;
    }
  }

  renderAudioBooks(audioBooks);

  localStorage.setItem("audioBooks", JSON.stringify(audioBooks));

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
});
