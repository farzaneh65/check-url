function createWarningBanner() {
  const banner = document.createElement("div");
  banner.innerHTML = `
    <div id="extension-warning-banner" >
      <div id="warning">⚠️ This site is not in the white list ☠️</div>
      <span id="close-extension-warning">&times; Close this window </span>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", function () {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.runtime.getURL("styles.css");
    document.head.appendChild(link);
    // Use body as a fallback in case document.body is still null
    const targetNode = document.body || document.documentElement;
    targetNode.prepend(banner);

    const closeButton = document.getElementById("close-extension-warning");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        banner.remove();
      });
    }
  });
}

// Listen for messages from the background script

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "createWarningBanner") {
    createWarningBanner();
  }
});
