// background.js
let lastActiveTabUrl = null;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  // Get the details of the active tab
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    // Check if the tab is fully loaded (tab.url exists) and has a valid URL
    if (tab && tab.url && tab.url.startsWith("http")) {
      lastActiveTabUrl = tab.url;
      console.log("Page loaded:", lastActiveTabUrl);
      let cleanURL = getDomain(lastActiveTabUrl);
      let urlParts = cleanURL.split(".");

      console.log(urlParts.length);
      if (urlParts.length > 2) {
        cleanURL =
          urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
      }
      console.log(cleanURL);
      checkURL(cleanURL);
    }
  });
});
chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.frameId === 0) {
    lastActiveTabUrl = details.url;
    console.log("Page loaded:", lastActiveTabUrl);
    let cleanURL = getDomain(lastActiveTabUrl);
    let urlParts = cleanURL.split(".");

    console.log(urlParts.length);
    if (urlParts.length > 2) {
      cleanURL =
        urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
    }
    console.log(cleanURL);
    checkURL(cleanURL);
  }
});

function checkURL(url) {
  if (lastActiveTabUrl && lastActiveTabUrl.startsWith("http")) {
    fetch(chrome.runtime.getURL("whitelist.txt"))
      .then((response) => response.text())
      .then((whitelist) => {
        const whitelistedURLs = whitelist
          .split("\n")
          .map((line) => line.trim());
        const isWhitelisted = whitelistedURLs.includes(url);

        const iconPath = isWhitelisted
          ? "icon/icon-whitelisted.png"
          : "icon/not-in-list.png";

        chrome.action.setIcon({
          path: { 16: iconPath, 48: iconPath, 128: iconPath },
        });
      })
      .catch((error) => console.error("Error loading whitelist:", error));
  }
}

function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error(e.message);
    return null;
  }
}
