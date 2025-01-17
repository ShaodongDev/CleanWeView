document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-extension");
  const widthRange = document.getElementById("width-range");

  // Initialize the extension state and width range value
  chrome.storage.sync.get(["extensionEnabled", "pageWidth"], (result) => {
    if (result.extensionEnabled) {
      toggleButton.textContent = "Disable Extension";
      widthRange.disabled = false;
      if (result.pageWidth) {
        widthRange.value = result.pageWidth;
      }
      // Apply the stored width
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (width) => {
            document.querySelector(
              "#page-content > div"
            ).style.maxWidth = `${width}%`;
          },
          args: [result.pageWidth || 80],
        });
      });
    } else {
      toggleButton.textContent = "Enable Extension";
      widthRange.disabled = true;
    }
  });

  // Toggle extension on/off
  toggleButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === "ON" ? "OFF" : "ON";

    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    if (nextState === "ON") {
      await chrome.scripting.insertCSS({
        files: ["clean_we_view.css"],
        target: { tabId: tab.id },
      });
      toggleButton.textContent = "Disable Extension";
      widthRange.disabled = false;
      chrome.storage.sync.set({ extensionEnabled: true });

      // Set width to user-defined value or default to 80%
      chrome.storage.sync.get("pageWidth", (result) => {
        const width = result.pageWidth || 80;
        widthRange.value = width;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (width) => {
            document.querySelector(
              "#page-content > div"
            ).style.maxWidth = `${width}%`;
          },
          args: [width],
        });
      });
    } else if (nextState === "OFF") {
      await chrome.scripting.removeCSS({
        files: ["clean_we_view.css"],
        target: { tabId: tab.id },
      });
      toggleButton.textContent = "Enable Extension";
      widthRange.disabled = true;
      chrome.storage.sync.set({ extensionEnabled: false });

      // Reset the width of #page-content > div to its original state
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.querySelector("#page-content > div").style.maxWidth = "";
        },
      });
    }
  });

  // Adjust width of #page-content > div
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
        document.querySelector(
          "#page-content > div"
        ).style.maxWidth = `${width}%`;
      },
      args: [width],
    });
  });
});
