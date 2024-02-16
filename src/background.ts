chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.highlight && message.articleContext) {
    chrome.tabs.create(
      {
        url: `https://chat.openai.com`,
      },
      (newTab) => {
        const checkTabReady = (tabId: number) => {
          chrome.tabs.get(tabId, (tab) => {
            if (tab.status === "complete") {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: setInputAndSubmit,
                args: [message.highlight, message.articleContext],
              })
            } else {
              setTimeout(() => checkTabReady(tabId), 100)
            }
          })
        }
        checkTabReady(newTab.id)
      }
    )
  }
})

function setInputAndSubmit(highlight: string, articleContext: string) {
  const textarea = document.querySelector(
    "#prompt-textarea"
  ) as HTMLTextAreaElement
  // Needs work
  const instructions =
    "Concisely explain my highlighted text in the broader article context. If it's a small term, like a proper noun, concisely expand on its meaning and include relevant facts."

  if (textarea) {
    const prompt = `
ARTICLE CONTEXT: ${articleContext}

USER HIGHLIGHT: ${highlight}

INSTRUCTIONS: ${instructions}`

    textarea.value = prompt
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
  } else {
    throw new Error("Textarea not found")
  }

  //   const sendButton = document.querySelector(
  //     'button[data-testid="send-button"]'
  //   ) as HTMLButtonElement
  //   if (sendButton) {
  //     sendButton.click()
  //   } else {
  //     throw new Error("Send button not found")
  //   }
}
