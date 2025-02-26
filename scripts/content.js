chrome.storage.sync.get(
  ["extensionEnabled", "pageWidth", "backgroundColor"],
  (result) => {
    // The values of "extensionEnabled", "pageWidth", and "backgroundColor" are stored in the result object.
    if (result.extensionEnabled) {
      const width = result.pageWidth || 80;
      document.querySelector(
        "#page-content > div"
      ).style.maxWidth = `${width}%`;
      // page-content > div selects only the div elements that are DIRECt children of #page-content.

      // Apply the saved background color if it exists
      if (result.backgroundColor) {
        const pageContent = document.querySelector("#page-content");
        if (pageContent) {
          pageContent.setAttribute(
            "style",
            `background-color: ${result.backgroundColor} !important`
          );

          // Apply text color if dark mode is selected
          if (result.backgroundColor === "#222831") {
            document
              .querySelectorAll("#page-content, #page-content *")
              .forEach((el) => {
                el.style.color = "#ffffff";
              });
          }
        }
      }

      // this creates a new <link> element which is used to link css and add it to <head> via append
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("clean_we_view.css");
      // .runtime to retrieve the current status of extenion including the structure tree so that the js knows where is the .css file
      document.head.append(link);

      // Remove original background-color from all inline styles
      const elements = document.querySelectorAll("*");
      elements.forEach((element) => {
        if (element.id !== "page-content") {
          element.style.backgroundColor = "";
        }
      });
    }
  }
);

// bg.js handles tasks that only need to checked once,like install refresh
// content.js reacts to user cations on the page in real-time
