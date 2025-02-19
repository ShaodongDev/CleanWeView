chrome.runtime.onInstalled.addListener(() => {
  // oninstalled Fires When the Extension is Installed or Updated
  chrome.storage.sync.get("extensionEnabled", (result) => {
    const text = result.extensionEnabled ? "ON" : "OFF";
    chrome.action.setBadgeText({ text });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // onupdated fires when the page is loaded
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get("extensionEnabled", (result) => {
      const text = result.extensionEnabled ? "ON" : "OFF";
      chrome.action.setBadgeText({ text, tabId: tabId });
      // attention, argument passs to the previous API function

      if (result.extensionEnabled) {
        chrome.scripting.insertCSS({
          // inset to DOM of target tab with tabID
          files: ["clean_we_view.css"],
          target: { tabId: tabId },
        });
      }
    });
  }
});
