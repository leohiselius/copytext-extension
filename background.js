chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: copyPageContent,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log("Content script executed.");
          }
        }
      );
    });
  }
});

function copyPageContent() {
  const body = document.body;
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNode(body);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand("copy");
  selection.removeAllRanges();
  console.log("Page content copied to clipboard.");
}
