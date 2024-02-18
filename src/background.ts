chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "tunnel") {
    chrome.system.display.getInfo((displays) => {
      if (displays.length > 0) {
        const { workArea } =
          displays.find((display) => display.isPrimary) || displays[0]
        const { width, height } = displays[0].bounds
        const windowWidth = Math.floor(width / 2)
        const windowHeight = height
        const windowLeft = Math.floor(width / 2)

        // this works in chrome but not in arc
        chrome.windows.create(
          {
            url: `https://chat.openai.com`,
            type: "popup",
            left: windowLeft,
            top: 0,
            width: windowWidth,
            height: windowHeight,
          },
          (newWindow) => {
            if (!newWindow) throw new Error("No new window exists")
            const newTabId = newWindow.tabs![0].id!
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
            checkTabReady(newTabId)
          }
        )
      }
    })
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
  const closeButton = document.querySelector(
    'button > span[data-state="closed"]'
  )?.parentNode as HTMLButtonElement
  if (closeButton) {
    closeButton.click()
  } else {
    console.log("Close sidebar button not found")
  }

  // wait, otherwise 3.5 will run instead of 4
  setTimeout(() => {
    const sendButton = document.querySelector(
      'button[data-testid="send-button"]'
    ) as HTMLButtonElement
    if (sendButton) {
      sendButton.click()
    } else {
      throw new Error("Send button not found")
    }
  }, 200)
}
