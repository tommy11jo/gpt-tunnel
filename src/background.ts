chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === "tunnel") {
    chrome.system.display.getInfo((displays) => {
      if (displays.length > 0) {
        const { width, height } = displays[0].bounds
        const windowWidth = Math.floor(width / 2)
        const windowHeight = height
        const windowLeft = Math.floor(width / 2)

        // split screen works in chrome but not in arc
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
                    args: [message.prompt],
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

function setInputAndSubmit(prompt: string) {
  const textarea = document.querySelector(
    "#prompt-textarea"
  ) as HTMLTextAreaElement

  if (textarea) {
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
    throw new Error("Close sidebar button not found")
  }

  function clickSend() {
    const sendButton = document.querySelector(
      'button[data-testid="send-button"]'
    ) as HTMLButtonElement
    if (sendButton) {
      sendButton.click()
    } else {
      throw new Error("Send button not found")
    }
  }

  // wait for model version to load before sending, otherwise GPT-4 doesn't work
  let count = 0
  const intervalId = setInterval(() => {
    // span containing either "", "3.5", or "4"
    const element = document.querySelector(
      "span.text-token-text-secondary"
    ) as HTMLElement

    if (element && element.textContent !== "") {
      clickSend()
      clearInterval(intervalId)
      return
    }

    count += 1
    if (count > 120) {
      // Stop after 3 seconds and the model version is still not found
      throw new Error("Model version not found")
    }
  }, 25)
}
