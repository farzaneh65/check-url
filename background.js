// background.js

let tabStatusMap = {};
const tabPorts = {};

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
      console.log(isIPAddress(cleanURL));
      let urlParts = cleanURL.split(".");

      console.log(urlParts.length);
      if (urlParts.length > 2) {
        cleanURL =
          urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
      }
      console.log(cleanURL);

      // if (cleanURL !== "new-tab-page") {
      //   getDNS(cleanURL);
      // }
      //createWarningBanner();
      //console.log(tabId);
      // createWarningBanner(tabId);
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
      !isWhitelisted && createWarningBanner(tabId);
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

function isIPAddress(url) {
  console.log(url);
  const urlParts = url.split(".");
  console.log("before filter", urlParts);
  const tempParts = urlParts.filter((part) => {
    if (part >= 0 && part <= 255) {
      return part;
    }
  });
  return tempParts.length == 4;
}

function updateIcon(isWhitelisted, url) {
  let iconPath;
  console.log(url);
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
}

// function getDNS(url) {
//   // Sample URL to be replaced with the user-entered URL
//   const userEnteredURL = url;

//   // Use a DNS lookup service (replace with your preferred service)
//   const dnsLookupAPI = "https://dns.google/resolve?name=";

//   // Make a request to the DNS lookup service
//   fetch(`${dnsLookupAPI}${userEnteredURL}`)
//     .then((response) => response.json())
//     .then((data) => {
//       // Check if the response is successful
//       if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
//         // Extract the IP address from the response
//         const ipAddress = data.Answer[0].data;
//         console.log(`IP address of ${userEnteredURL}: ${ipAddress}`);
//       } else {
//         console.error(`Failed to retrieve IP address for ${userEnteredURL}`);
//       }
//     })
//     .catch((error) => console.error("Error:", error));
// }

function createWarningBanner(tabId) {
  chrome.tabs.sendMessage(tabId, { action: "createWarningBanner" });
  //chrome.runtime.sendMessage({ action: "createWarningBanner" });
}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "content-script") {
    const tabId = port.sender.tab.id;
    tabPorts[tabId] = port;

    // Listen for messages from content scripts
    port.onMessage.addListener(function (msg) {
      if (msg.action === "createWarningBanner") {
        createWarningBanner(tabId);
      }
    });

    // Remove the port when the tab is closed
    port.onDisconnect.addListener(function () {
      delete tabPorts[tabId];
    });
  }
});

// function createWarningBanner(tabId) {
//   const port = tabPorts[tabId];
//   console.log(port);
//   if (port) {
//     port.postMessage({ action: "createWarningBanner" });
//   }
// }
