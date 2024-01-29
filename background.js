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
      //   console.log("onActivate-IF");
      //   const url = tab.url;
      //   console.log("Page loaded:", url);
      //   let cleanURL = getDomain(url);
      //   //console.log(isIPAddress(cleanURL));
      //   if (!isIPAddress(cleanURL)) {
      //     let urlParts = cleanURL.split(".");
      //     //console.log(urlParts.length);
      //     if (urlParts.length > 2) {
      //       cleanURL =
      //         urlParts[urlParts.length - 2] +
      //         "." +
      //         urlParts[urlParts.length - 1];
      //     }
      //     //console.log(cleanURL);
      //   }
      //   //createWarningBanner();
      //   //console.log(tabId);
      //   // createWarningBanner(tabId);
      //   if (cleanURL !== "new-tab-page") {
      //     checkURL(cleanURL, tabId);
      //   }
      // }
    });
  }
});

chrome.webNavigation.onCommitted.addListener(function (details) {
  console.log("onCommitted");
  console.log(tabStatusMap);
  //console.log(details.frameId);
  const transitionType = details.transitionType;
  console.log("transition Type: ", transitionType);
  if (details.frameId === 0) {
    console.log("fameId is 0");
    const tabId = details.tabId;
    console.log("tabId", tabId);

    if (tabStatusMap.hasOwnProperty(tabId) && transitionType === "reload") {
      console.log("Use the stored status");
      console.log("array:", tabStatusMap[tabId]);
      // Use the stored status
      updateIcon(tabStatusMap[tabId]);
    } else {
      console.log("Use new status");
      const url = details.url;
      console.log("Page loaded:", url);
      let cleanURL = getDomain(url);

      //console.log(isIPAddress(cleanURL));
      if (!isIPAddress(cleanURL)) {
        let urlParts = cleanURL.split(".");

        //console.log(urlParts.length);
        if (urlParts.length > 2) {
          cleanURL =
            urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
        }
        //console.log(cleanURL);
      }

      //createWarningBanner();
      //console.log(tabId);
      // createWarningBanner(tabId);

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

// chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
//   const tabId = details.tabId;

//   console.log("Use new status-HistoryStateUpdate");
//   const url = details.url;
//   console.log("Page loaded:", url);
//   let cleanURL = getDomain(url);

//   //console.log(isIPAddress(cleanURL));
//   if (!isIPAddress(cleanURL)) {
//     let urlParts = cleanURL.split(".");

//     //console.log(urlParts.length);
//     if (urlParts.length > 2) {
//       cleanURL =
//         urlParts[urlParts.length - 2] + "." + urlParts[urlParts.length - 1];
//     }
//     //console.log(cleanURL);
//   }

//   //createWarningBanner();
//   //console.log(tabId);
//   // createWarningBanner(tabId);
//   if (cleanURL !== "new-tab-page" && tabId) {
//     checkURL(cleanURL, tabId);
//   }
// });

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // Remove the tab from the tabStatusMap when it is closed
  delete tabStatusMap[tabId];
  //console.log(tabStatusMap);
});

function checkURL(url, tabId) {
  fetch(chrome.runtime.getURL("whitelist.txt"))
    .then((response) => response.text())
    .then((whitelist) => {
      const whitelistedURLs = whitelist.split("\n").map((line) => line.trim());
      const isWhitelisted = whitelistedURLs.includes(url);
      //console.log(isWhitelisted);
      tabStatusMap[tabId] = isWhitelisted;
      // if (!isWhitelisted) {
      //   createWarningBanner(tabId);
      // }
      //!isWhitelisted && createWarningBanner(tabId);
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
  //console.log(url);
  const urlParts = url.split(".");
  //console.log("before filter", urlParts);
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
  //console.log(tabStatusMap[tabId]);
  if (!isWhitelisted && tabId > 0) {
    console.log("Not In List!!");
    createWarningBanner1(tabId);
  }
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

function createWarningBanner1(tabId) {
  try {
    console.log("Send Message!!!", tabId);
    //chrome.runtime.sendMessage({ action: "createWarningBanner" });
    chrome.tabs.sendMessage(tabId, { action: "createWarningBanner" });
  } catch (error) {
    console.log(error);
    //chrome.runtime.lastError;
    return null;
  }
}

// browser.runtime.sendMessage({ hello: "goodbye" }).then(function (response) {
//   console.log("UUUUUUUUU");
// });

// function createWarningBanner(tabId) {
//   try {
//     console.log(tabId);
//     chrome.tabs.sendMessage(
//       tabId,
//       { action: "createWarningBanner" },
//       function (response) {
//         // Handle the response here if needed
//         console.log("Response from content script:", response);
//       }
//     );
//   } catch (error) {
//     console.error(error);
//   }
// }

// chrome.runtime.onConnect.addListener(function (port) {
//   if (port.name === "content-script") {
//     const tabId = port.sender.tab.id;
//     tabPorts[tabId] = port;

//     // Listen for messages from content scripts
//     port.onMessage.addListener(function (msg) {
//       if (msg.action === "createWarningBanner") {
//         try {
//           return createWarningBanner(tabId);
//         } catch (e) {
//           console.log(e);
//           return null;
//         }
//       }
//     });

//     // Remove the port when the tab is closed
//     port.onDisconnect.addListener(function () {
//       delete tabPorts[tabId];
//     });
//   }
// });

// function createWarningBanner(tabId) {
//   const port = tabPorts[tabId];
//   console.log(port);
//   if (port) {
//     port.postMessage({ action: "createWarningBanner" });
//   }
// }

// chrome.runtime.onInstalled.addListener(async () => {
//   for (const cs of chrome.runtime.getManifest().content_scripts) {
//     for (const tab of await chrome.tabs.query({ url: cs.matches })) {
//       chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: cs.js,
//       });
//     }
//   }
// });
