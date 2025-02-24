chrome.storage.sync.get(["extensionEnabled", "pageWidth"], (result) => {
  if (result.extensionEnabled) {
    const width = result.pageWidth || 80;
    document.querySelector("#page-content > div").style.maxWidth = `${width}%`;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("clean_we_view.css");
    document.head.append(link);

    // Remove background-color from all inline styles
    const elements = document.querySelectorAll("*");
    elements.forEach((element) => {
      element.style.backgroundColor = "";
    });
  }
});
