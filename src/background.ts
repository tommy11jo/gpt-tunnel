chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "tunnel") {
    chrome.tabs.create(
      {
        url: `https://chat.openai.com`,
      },
      (newTab) => {
        const checkTabReady = (tabId: number) => {
          chrome.tabs.get(tabId, (tab) => {
            if (tab.status === "complete") {
              chrome.scripting.executeScript({
                target: { tabId: tab.id! },
                func: setInputAndSubmit,
                args: [
                  message.highlight,
                  message.articleContext,
                  message.input,
                ],
              })
            } else {
              setTimeout(() => checkTabReady(tabId), 100)
            }
          })
        }
        checkTabReady(newTab.id!)
      }
    )
  }
})

function setInputAndSubmit(
  highlight: string,
  articleContext: string,
  input: string
) {
  const textarea = document.querySelector(
    "#prompt-textarea"
  ) as HTMLTextAreaElement

  if (textarea) {
    let prompt = ""
    if (highlight) {
      prompt = `
ARTICLE CONTEXT: ${articleContext}

USER HIGHLIGHT: ${highlight}

PROMPT: ${input}`
    } else {
      prompt = `
        ARTICLE CONTEXT: ${articleContext}
        
        PROMPT: ${input}`
    }
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
