type RecursiveDir = (string | RecursiveDir)[];

const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
fileInput.addEventListener("click", async (e) => {
  const { files, input } = await (window as any).electronAPI.openDir();
  console.log(files, input);

  const root = document.getElementById("root")! as HTMLDivElement;

  root.replaceChildren()

  const addListItem = (
    fileArray: RecursiveDir,
    parentElement: HTMLDivElement,
    folderName: string
  ) => {
    const elementList = document.createElement("div");
    for (let i = 0; i < fileArray.length; i++) {
      if (typeof fileArray[i] === "string") {
        const fileElement = document.createElement("div");
        fileElement.textContent = (fileArray[i] as string).replace(
          new RegExp(`${folderName}/`, "g"),
          ""
        );
        elementList.append(fileElement);
      } else {
        // console.log(file)
        addListItem(
          fileArray[i] as RecursiveDir,
          elementList,
          fileArray[i - 1] as string
        );
      }
    }
    parentElement.append(elementList);
  };

  addListItem(files, root, input);
});
