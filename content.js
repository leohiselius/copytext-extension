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

copyPageContent();
