document.getElementById("run").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "copyContent" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log("Message sent to background script.");
    }
  });
});
