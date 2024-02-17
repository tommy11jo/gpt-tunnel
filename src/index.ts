import { renderChatBox } from "./ChatBox"
import { collectPrecedingText } from "./dom-parser"

document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.code === "KeyX"
  ) {
    const selection = window.getSelection()
    if (selection !== null) {
      const selString = selection?.toString().trim()
      const range = selection.getRangeAt(0)
      let startNode = range.startContainer
      const articleContext = collectPrecedingText(startNode)
      renderChatBox(selString, articleContext)
    } else {
      // probably use readibility here to get main text
      renderChatBox()
    }
  }
})
