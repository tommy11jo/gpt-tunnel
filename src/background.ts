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
  const instructions =
    "Concisely explain my highlighted text in the broader article context."

  if (textarea) {
    const prompt = `${instructions}
ARTICLE CONTEXT: ${articleContext}

USER HIGHLIGHT: ${highlight}`

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
