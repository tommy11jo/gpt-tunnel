document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyX"
  ) {
    const selection = window.getSelection()?.toString().trim()
    if (selection) {
      chrome.runtime.sendMessage({
        highlight: selection,
        articleContext: "N/A",
      })
    }
  }
})
