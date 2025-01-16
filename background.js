chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

const gzh = "https://mp.weixin.qq.com/s/";

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(gzh)) {
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
    } else if (nextState === "OFF") {
      await chrome.scripting.removeCSS({
        files: ["clean_we_view.css"],
        target: { tabId: tab.id },
      });
    }
  }
});
