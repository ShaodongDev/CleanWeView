chrome.storage.sync.get(["extensionEnabled", "pageWidth"], (result) => {
  // The values of "extensionEnabled" and "pageWidth" are stored in the result object.
  if (result.extensionEnabled) {
    const width = result.pageWidth || 80;
    document.querySelector("#page-content > div").style.maxWidth = `${width}%`;
    // page-content > div selects only the div elements that are DIRECt children of #page-content.

    // this creates a new <link> element which is used to link css and add it to <head> via append
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("clean_we_view.css");
    // .runtime to retrieve the current status of extenion including the structure tree so that the js knows where is the .css file
    document.head.append(link);

    // Remove original background-color from all inline styles
    const elements = document.querySelectorAll("*");
    elements.forEach((element) => {
      element.style.backgroundColor = "";
    });
  }
});

// bg.js handles tasks that only need to checked once,like install refresh
// content.js reacts to user cations on the page in real-time
