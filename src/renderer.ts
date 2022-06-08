type RecursiveDir = {
  folder: string;
  children: (RecursiveDir | string)[];
};

const fileInput = document.getElementById("folderPicker")! as HTMLButtonElement;
fileInput.addEventListener("click", async (e) => {
  const { files, input } = await (window as any).electronAPI.openDir();
  console.log(files, input);

  const root = document.getElementById("root")! as HTMLDivElement;

  root.replaceChildren();

  const title = document.createElement("h3");
  title.textContent = input;
  root.append(title);

  const addListItem = (
    fileArray: (RecursiveDir | string)[],
    parentElement: HTMLDivElement,
    folderName: string
  ) => {
    const elementList = document.createElement("div");
    for (let i = 0; i < fileArray.length; i++) {
      if (typeof fileArray[i] === "string") {
        const fileElement = document.createElement("p");
        fileElement.textContent =
          "📄 " +
          (fileArray[i] as string).replace(
            new RegExp(`${folderName}/`, "g"),
            ""
          );
        elementList.append(fileElement);
      } else {
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
          (fileArray[i] as RecursiveDir).folder.replace(
            new RegExp(`${folderName}/`, "g"),
            ""
          );
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

  addListItem(files, root, input);
});
