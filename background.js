// Listen for tab updates and inject content script if the page has loaded completely
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
   if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
      chrome.scripting.executeScript(
         {
            target: { tabId: tabId },
            files: ["content.js"]
         },
         () => {
            if (chrome.runtime.lastError) {
               console.error("Script injection failed:", chrome.runtime.lastError.message);
            } else {
               console.log("Script injected successfully");
            }
         }
      );
   }
 });
 
 // Listen for navigation errors to detect blocked/insecure sites
 chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId === 0) { // Only handle the main frame
        console.log("Navigation error detected:", details);
 
        // Check if the error is due to a blocked or insecure response
        if (details.error.includes("net::ERR_BLOCKED_BY_CLIENT") || details.error.includes("net::ERR_INSECURE_RESPONSE")) {
            // Show a fallback notification for the blocked or insecure site
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "Phishing Alert",
                message: "The site you attempted to visit has been flagged as potentially dangerous."
            });
        }
    }
 });
 