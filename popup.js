document.addEventListener("DOMContentLoaded", async () => {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const widthRange = document.getElementById("width-range");

  // Load the initial state from storage
  chrome.storage.sync.get(["extensionEnabled", "pageWidth"], async (result) => {
    toggleSwitch.checked = result.extensionEnabled || false;
    widthRange.value = result.pageWidth || 80;
    widthRange.disabled = !toggleSwitch.checked;

    // Apply the stored width setting if the extension is enabled
    if (toggleSwitch.checked) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (width) => {
          const element = document.querySelector("#page-content > div");
          if (element) {
            element.style.maxWidth = `${width}%`;
          }
        },
        args: [result.pageWidth || 80],
      });
    }
  });

  // Handle switch toggle
  toggleSwitch.addEventListener("change", async (event) => {
    const isEnabled = event.target.checked;
    chrome.storage.sync.set({ extensionEnabled: isEnabled });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (isEnabled) {
      chrome.action.setBadgeText({ text: "ON", tabId: tab.id });
      chrome.scripting.insertCSS({
        files: ["clean_we_view.css"],
        target: { tabId: tab.id },
      });
      widthRange.disabled = false;

      // Apply the stored width setting
      chrome.storage.sync.get("pageWidth", (result) => {
        const width = result.pageWidth || 80;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (width) => {
            const element = document.querySelector("#page-content > div");
            if (element) {
              element.style.maxWidth = `${width}%`;
            }
          },
          args: [width],
        });
      });
    } else {
      chrome.action.setBadgeText({ text: "OFF", tabId: tab.id });
      chrome.scripting.removeCSS({
        files: ["clean_we_view.css"],
        target: { tabId: tab.id },
      });
      widthRange.disabled = true;

      // Reset the page to its original state
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const element = document.querySelector("#page-content > div");
          if (element) {
            element.style.maxWidth = "";
          }
        },
      });
    }
  });

  // Handle width range change
  widthRange.addEventListener("input", async (event) => {
    const width = event.target.value;
    chrome.storage.sync.set({ pageWidth: width });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (width) => {
        const element = document.querySelector("#page-content > div");
        if (element) {
          element.style.maxWidth = `${width}%`;
        }
      },
      args: [width],
    });
  });
});
