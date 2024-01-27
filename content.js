function createWarningBanner() {
  const banner = document.createElement("div");
  banner.innerHTML = `
    <div id="extension-warning-banner" style="background-color: #FFD700; color: #000; padding: 30px; text-align: center; font-weight: bold;">
      ⚠️ This site is not in the white list ☠️
    </div>
  `;

  // Apply styles and specific selector
  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.zIndex = "9999"; // Set a high z-index
  banner.style.fontSize = "1.5rem";
  banner.id = "extension-warning-banner";

  document.body.prepend(banner);
}

// Listen for messages from the background script

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "createWarningBanner") {
    createWarningBanner();
  }
});

const port = chrome.runtime.connect({ name: "content-script" });

document.addEventListener("DOMContentLoaded", function () {
  // Send a message to the background script through the port
  port.postMessage({ action: "createWarningBanner" });
});
