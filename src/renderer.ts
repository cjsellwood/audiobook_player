type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
const root = document.getElementById("root")! as HTMLDivElement;

fileInput.addEventListener("click", async (e) => {
  root.append((document.createElement("h1").textContent = "LOADING"));
  const { files, input, audioBooks } = await (
    window as any
  ).electronAPI.openDir();
  // console.log(files, input);

  root.replaceChildren();

  const ul = document.createElement("ul");

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

  for (let audioBook of audioBooks) {
    const li = document.createElement("li");
    li.style.display = "grid";
    li.style.gridTemplateColumns = "repeat(7, 1fr)";

    const coverImg = document.createElement("img");
    coverImg.src = URL.createObjectURL(
      new Blob([audioBook.cover.data], { type: audioBook.cover.format })
    );
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

  const addListItem = (
    fileArray: (RecursiveDir | string)[],
    parentElement: HTMLDivElement,
    folderName: string
  ) => {
    const elementList = document.createElement("div");
    const re = new RegExp(
      `${folderName.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}/`,
      "g"
    );

    for (let i = 0; i < fileArray.length; i++) {
      if (typeof fileArray[i] === "string") {
        const fileElement = document.createElement("p");
        fileElement.textContent =
          "📄 " + (fileArray[i] as string).replace(re, "");

        elementList.append(fileElement);
      } else {
        const folderP = document.createElement("p");
        folderP.textContent =
          "📁 " + (fileArray[i] as RecursiveDir).folder.replace(re, "");

        elementList.append(folderP);

        addListItem(
          (fileArray[i] as RecursiveDir).children as (RecursiveDir | string)[],
          elementList,
          (fileArray[i] as RecursiveDir).folder
        );
      }
    }
    parentElement.append(elementList);
  };

  console.log(audioBooks);

  addListItem(files, root, input);
});
