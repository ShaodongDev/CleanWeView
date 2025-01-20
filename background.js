chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("extensionEnabled", (result) => {
    const text = result.extensionEnabled ? "ON" : "OFF";
    chrome.action.setBadgeText({ text });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Update the badge text based on the actual state of the extension
    chrome.storage.sync.get("extensionEnabled", (result) => {
      const text = result.extensionEnabled ? "ON" : "OFF";
      chrome.action.setBadgeText({ text, tabId: tabId });

      // Inject the CSS if the extension is enabled
      if (result.extensionEnabled) {
        chrome.scripting.insertCSS({
          files: ["clean_we_view.css"],
          target: { tabId: tabId },
        });
      }
    });
  }
});
