import { collectPrecedingText } from "./dom-parser"

document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyX"
  ) {
    const selection = window.getSelection()
    if (selection) {
      const selString = selection.toString().trim()
      const range = selection.getRangeAt(0)
      let startNode = range.startContainer
      const articleContext = collectPrecedingText(startNode)
      //   console.log("context", articleContext)
      chrome.runtime.sendMessage({
        highlight: selString,
        articleContext: articleContext,
      })
    }
  }
})
