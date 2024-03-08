import { renderChatBox } from "./ChatBox"
import { loadCmdConfig } from "./SetupModal"
import { collectPrecedingText } from "./dom-parser"
import { Readability } from "@mozilla/readability"

let isChatBoxOpen = false

export function closeChatBox() {
  isChatBoxOpen = false
}

let cmdConfig: Record<string, any> | null = null
document.addEventListener("keydown", async (event) => {
  if (cmdConfig == null) cmdConfig = await loadCmdConfig()
  if (
    event.key == cmdConfig["key"] &&
    event.ctrlKey == cmdConfig["ctrl"] &&
    event.metaKey == cmdConfig["meta"] &&
    event.shiftKey == cmdConfig["shift"] &&
    event.altKey == cmdConfig["alt"]
  ) {
    if (isChatBoxOpen) return
    const selection = window.getSelection()
    if (selection !== null && !selection.isCollapsed) {
      const selString = selection?.toString().trim()
      const range = selection.getRangeAt(0)
      let startNode = range.startContainer
      const articleContext = collectPrecedingText(startNode)
      renderChatBox(articleContext, selString)
      isChatBoxOpen = true
    } else {
      const MAX_CHARS = 8000
      const articleContext = getMainText().substring(0, MAX_CHARS)
      renderChatBox(articleContext)
      isChatBoxOpen = true
    }
  }
})

function getMainText() {
  const documentClone = document.cloneNode(true) as Document
  const article = new Readability(documentClone).parse()
  if (!article) throw new Error("Readibility failed to parse doc")
  return article.textContent
}
