document.addEventListener("DOMContentLoaded", async () => {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const widthRange = document.getElementById("width-range");

  chrome.storage.sync.get(["extensionEnabled", "pageWidth"], async (result) => {
    toggleSwitch.checked = result.extensionEnabled || false;
    widthRange.value = result.pageWidth || 80;
    widthRange.disabled = !toggleSwitch.checked;

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

// for href of title
document.addEventListener("DOMContentLoaded", function () {
  const link = document.querySelector(".title-link");
  if (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const url = link.getAttribute("href");
      chrome.tabs.create({ url });
    });
  }
});
