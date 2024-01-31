// background.js

let tabStatusMap = {};
const tabPorts = {};

chrome.tabs.onActivated.addListener(function (activeInfo) {
  //onActivated

  const tabId = activeInfo.tabId;

  chrome.tabs.get(activeInfo.tabId, function (tab) {
    const url = tab.url;

    if (tabStatusMap.hasOwnProperty(tabId)) {
      //Use the stored status

      updateIcon(tabStatusMap[tabId], url, tabId);
    } else {
      //Use new status
      //Check if the tab is fully loaded (tab.url exists) and has a valid URL
      if (tab && tab.url && tab.url.startsWith("http")) {
        //onActivate-IF
        let cleanURL = getDomain(url);
        if (!isIPAddress(cleanURL)) {
          let urlParts = cleanURL.split(".");
          if (urlParts.length > 2) {
            cleanURL =
              urlParts[urlParts.length - 2] +
              "." +
              urlParts[urlParts.length - 1];
          }
        }

        checkURL(cleanURL, tabId);
      } else {
        iconPath = "icon/unknownIcon.png";
        chrome.action.setIcon({
          path: { 16: iconPath, 48: iconPath, 128: iconPath },
        });
      }
    }
  });
});

chrome.webNavigation.onCommitted.addListener(function (details) {
  //onCommitted
  const transitionType = details.transitionType;
  const url = details.url;

  if (details.frameId === 0) {
    const tabId = details.tabId;
    // Check if the tab is loaded
    if (tabStatusMap.hasOwnProperty(tabId) && transitionType === "reload") {
      //Use the stored status

      updateIcon(tabStatusMap[tabId], url, tabId);
    } else {
      //Use new status
      let cleanURL = getDomain(url);
      if (!isIPAddress(cleanURL)) {
        let urlParts = cleanURL.split(".");
        if (urlParts.length > 2) {
          cleanURL =
            urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
        }
      }
      if (cleanURL !== "new-tab-page") {
        checkURL(cleanURL, tabId);
      } else {
        iconPath = "icon/unknownIcon.png";
        chrome.action.setIcon({
          path: { 16: iconPath, 48: iconPath, 128: iconPath },
        });
      }
    }
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // Remove the tab from the tabStatusMap when it is closed
  delete tabStatusMap[tabId];
});

function checkURL(url, tabId) {
  fetch(chrome.runtime.getURL("whitelist.txt"))
    .then((response) => response.text())
    .then((whitelist) => {
      const whitelistedURLs = whitelist.split("\n").map((line) => line.trim());
      const isWhitelisted = whitelistedURLs.includes(url);
      tabStatusMap[tabId] = isWhitelisted;
      updateIcon(isWhitelisted, url, tabId);
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

function isIPAddress(url) {
  const urlParts = url.split(".");
  return (
    urlParts.filter((part) => {
      if (part >= 0 && part <= 255) {
        return part;
      }
    }).length == 4
  );
}

function updateIcon(isWhitelisted, url, tabId) {
  let iconPath;

  if (url === "new-tab-page") {
    iconPath = "icon/unknownIcon.png";
  } else {
    iconPath = isWhitelisted
      ? "icon/whitelist-icon.png"
      : "icon/notWhitelist-icon.png";
  }

  chrome.action.setIcon({
    path: { 16: iconPath, 48: iconPath, 128: iconPath },
  });

  if (!isWhitelisted && tabId > 0) {
    createWarningBanner(tabId);
  }
}

function createWarningBanner(tabId) {
  try {
    chrome.tabs.sendMessage(tabId, { action: "createWarningBanner" });
  } catch (error) {
    console.log(error);
    return null;
  }
}
