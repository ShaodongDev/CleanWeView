document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-extension");
  const widthRange = document.getElementById("width-range");

  // Initialize the extension state and width range value
  chrome.storage.sync.get(["extensionEnabled", "pageWidth"], (result) => {
    if (result.extensionEnabled) {
      toggleButton.textContent = "Disable Extension";
      widthRange.disabled = false;
    } else {
      toggleButton.textContent = "Enable Extension";
      widthRange.disabled = true;
    }
    if (result.pageWidth) {
      widthRange.value = result.pageWidth;
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
