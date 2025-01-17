chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("extensionEnabled", (result) => {
    const text = result.extensionEnabled ? "ON" : "OFF";
    chrome.action.setBadgeText({ text });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get("extensionEnabled", (result) => {
      const text = result.extensionEnabled ? "ON" : "OFF";
      chrome.action.setBadgeText({ text, tabId: tabId });

      if (result.extensionEnabled) {
        chrome.scripting.insertCSS({
          files: ["clean_we_view.css"],
          target: { tabId: tabId },
        });
      }
    });
  }
});
