chrome.storage.sync.get(
  ["extensionEnabled", "pageWidth", "backgroundColor"],
  (result) => {
    if (result.extensionEnabled) {
      const width = result.pageWidth || 80;
      document.querySelector(
        "#page-content > div"
      ).style.maxWidth = `${width}%`;

      if (result.backgroundColor) {
        const pageContent = document.querySelector("#page-content");
        if (pageContent) {
          pageContent.setAttribute(
            "style",
            `background-color: ${result.backgroundColor} !important`
          );

          if (result.backgroundColor === "#222831") {
            document
              .querySelectorAll("#page-content, #page-content *")
              .forEach((el) => {
                el.style.color = "#ffffff";
              });
          }
        }
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("clean_we_view.css");
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
