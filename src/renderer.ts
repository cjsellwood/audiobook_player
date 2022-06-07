type RecursiveDir = (string | RecursiveDir)[];

const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
fileInput.addEventListener("click", async (e) => {
  const { files, input } = await (window as any).electronAPI.openDir();
  console.log(files);

  const root = document.getElementById("root")! as HTMLDivElement;

  const addListItem = (
    fileArray: RecursiveDir,
    parentElement: HTMLDivElement
  ) => {
    const elementList = document.createElement("div");
    for (let file of fileArray) {
      if (typeof file === "string") {
        const fileElement = document.createElement("div");
        fileElement.textContent = file.replace(new RegExp(`${input}/`, "g"), "");
        elementList.append(fileElement);
      } else {
        console.log(file)
        addListItem(file, elementList);
      }
    }
    parentElement.append(elementList);
  };

  addListItem(files, root);
});
