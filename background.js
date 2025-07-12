chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"]
    }, () => {
      chrome.tabs.sendMessage(tabId, { action: "extractAndDetectBitB" });
    });
  }
});
