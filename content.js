chrome.storage.sync.get(["extensionEnabled", "pageWidth"], (result) => {
  if (result.extensionEnabled) {
    const width = result.pageWidth || 80;
    document.querySelector("#page-content > div").style.maxWidth = `${width}%`;
  }
});
