// background.js

let tabStatusMap = {};

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log("onActivated");
  const tabId = activeInfo.tabId;
  console.log(tabId);
  if (tabStatusMap.hasOwnProperty(tabId)) {
    console.log("Use the stored status");
    updateIcon(tabStatusMap[tabId]);
  } else {
    console.log("Use new status");
    chrome.tabs.get(activeInfo.tabId, function (tab) {
      // Check if the tab is fully loaded (tab.url exists) and has a valid URL
      // if (tab && tab.url && tab.url.startsWith("http")) {
      //   console.log("Here!!");
      //   const url = tab.url;
      //   console.log("Page loaded:", url);
      //   let cleanURL = getDomain(url);
      //   let urlParts = cleanURL.split(".");
      //   console.log(urlParts.length);
      //   if (urlParts.length > 2) {
      //     cleanURL =
      //       urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
      //   }
      //   console.log(cleanURL);
      //   checkURL(cleanURL, tabId);
      // }
    });
  }
  // Get the details of the active tab
});
chrome.webNavigation.onCompleted.addListener(function (details) {
  console.log("onCompleted");
  console.log(tabStatusMap);
  if (details.frameId === 0) {
    const tabId = details.tabId;
    console.log(tabId);
    if (tabStatusMap.hasOwnProperty(tabId) && tabStatusMap[tabId].loaded) {
      console.log("Use the stored status");
      console.log(tabStatusMap[tabId]);
      // Use the stored status
      updateIcon(tabStatusMap[tabId]);
    } else {
      console.log("Use new status");
      const url = details.url;
      console.log("Page loaded:", url);
      let cleanURL = getDomain(url);
      let urlParts = cleanURL.split(".");

      console.log(urlParts.length);
      if (urlParts.length > 2) {
        cleanURL =
          urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
      }
      console.log(cleanURL);
      checkURL(cleanURL, tabId);
    }
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // Remove the tab from the tabStatusMap when it is closed
  delete tabStatusMap[tabId];
  console.log(tabStatusMap);
});

function checkURL(url, tabId) {
  fetch(chrome.runtime.getURL("whitelist.txt"))
    .then((response) => response.text())
    .then((whitelist) => {
      const whitelistedURLs = whitelist.split("\n").map((line) => line.trim());
      const isWhitelisted = whitelistedURLs.includes(url);

      tabStatusMap[tabId] = isWhitelisted;
      updateIcon(isWhitelisted, url);
    })
    .catch((error) => console.error("Error loading whitelist:", error));
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

function updateIcon(isWhitelisted, url) {
  let iconPath;
  console.log(url);
  if (url === "new-tab-page") {
    iconPath = "icon/icon.png";
  } else {
    iconPath = isWhitelisted
      ? "icon/icon-whitelisted.png"
      : "icon/not-in-list.png";
  }

  chrome.action.setIcon({
    path: { 16: iconPath, 48: iconPath, 128: iconPath },
  });
}
