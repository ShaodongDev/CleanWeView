document.addEventListener("DOMContentLoaded", async () => {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const widthRange = document.getElementById("width-range");
  const colorOptions = document.querySelectorAll(
    'input[name="background-color"]'
  );

  chrome.storage.sync.get(
    ["extensionEnabled", "pageWidth", "backgroundColor"],
    async (result) => {
      toggleSwitch.checked = result.extensionEnabled || false;
      widthRange.value = result.pageWidth || 80;
      widthRange.disabled = !toggleSwitch.checked;

      // Set the saved radio button as checked
      if (result.backgroundColor) {
        document.querySelector(
          `input[value="${result.backgroundColor}"]`
        ).checked = true;
      }

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
    }
  );

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

      chrome.storage.sync.get(["pageWidth", "backgroundColor"], (result) => {
        const width = result.pageWidth || 80;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (width, backgroundColor) => {
            const contentElement = document.querySelector("#page-content");
            const divElement = document.querySelector("#page-content > div");

            if (divElement) {
              divElement.style.maxWidth = `${width}%`;
            }

            if (contentElement && backgroundColor) {
              contentElement.style.backgroundColor =
                backgroundColor + " !important";

              // Change text color to white if background is dark
              if (backgroundColor === "#222831") {
                document
                  .querySelectorAll("#page-content, #page-content *")
                  .forEach((el) => {
                    el.style.color = "#ffffff";
                  });
              }
            }
          },
          args: [width, result.backgroundColor],
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
          const contentElement = document.querySelector("#page-content");
          const divElement = document.querySelector("#page-content > div");

          if (divElement) {
            divElement.style.maxWidth = "";
          }

          if (contentElement) {
            contentElement.style.backgroundColor = "";
          }

          // Reset text color
          document
            .querySelectorAll("#page-content, #page-content *")
            .forEach((el) => {
              el.style.color = "";
            });
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

  // Add event listeners to all color radio buttons
  colorOptions.forEach((option) => {
    option.addEventListener("change", async (event) => {
      if (event.target.checked) {
        const selectedColor = event.target.value;

        // Save the selected color to storage
        chrome.storage.sync.set({ backgroundColor: selectedColor });

        // Apply color change if extension is enabled
        if (toggleSwitch.checked) {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });

          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (color) => {
              const contentElement = document.querySelector("#page-content");
              if (contentElement) {
                contentElement.style.backgroundColor = color;
                // Force the style to be applied with higher specificity
                contentElement.setAttribute(
                  "style",
                  `background-color: ${color} !important`
                );

                // Set text color based on background color
                if (color === "#222831") {
                  // Dark mode - set text to white
                  document
                    .querySelectorAll("#page-content, #page-content *")
                    .forEach((el) => {
                      el.style.color = "#ffffff";
                    });
                } else {
                  // Light mode - reset text color
                  document
                    .querySelectorAll("#page-content, #page-content *")
                    .forEach((el) => {
                      el.style.color = "";
                    });
                }
              }
            },
            args: [selectedColor],
          });
        }
      }
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
