export function collectPrecedingText(startNode: Node): string {
  const nodes = linearizedTextualNodes(startNode)

  const maxChars = 2000
  let text = ""
  for (const node of nodes.reverse()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const newContent = (node.textContent || "").replace(/[\s]+/g, " ")
      text = newContent + text

      // Add a newline for the end of a paragraph
      if (
        node.parentNode &&
        node.parentNode.nodeName === "P" &&
        node.parentNode.lastChild === node
      ) {
        text = "\n" + text
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
      text = "\n" + text
    } else {
      throw new Error("Only TEXT and BR nodes are legal")
    }

    if (text.length > maxChars) {
      text = text.substring(text.length - maxChars)
      break
    }
  }
  return text
}
function linearizedTextualNodes(startNode: Node): Node[] {
  // Get a linearized list of text and br nodes, up to startNode (exclusive)
  let reachedStartNode = false
  let nodes: Node[] = []

  function isTextualNode(node: Node): boolean {
    return (
      (node.nodeType === Node.TEXT_NODE && isVisible(node.parentNode)) ||
      node.nodeName === "BR"
    )
  }

  function dfs(currentNode: Node) {
    if (reachedStartNode) {
      return
    }
    if (currentNode === startNode) {
      nodes.push(currentNode)
      reachedStartNode = true
      return
    }

    if (isTextualNode(currentNode)) {
      nodes.push(currentNode)
    }

    currentNode.childNodes.forEach((child) => {
      dfs(child)
    })
  }

  dfs(document.body)

  return nodes
}
function isVisible(element: Node | null): boolean {
  if (!(element instanceof HTMLElement)) return false
  const style = window.getComputedStyle(element)
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  )
}
