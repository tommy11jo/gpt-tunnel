import React, { useRef, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
type ChatBoxProps = {
  highlight?: string
  articleContext?: string
}
const ChatBox: React.FC<ChatBoxProps> = ({ highlight, articleContext }) => {
  const [input, setInput] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isVisible])

  function handleSend(input: string) {
    const instructions =
      input ||
      "Concisely explain my highlighted text in the broader article context. If it's a small term, like a proper noun, concisely expand on its meaning and include relevant facts."
    chrome.runtime.sendMessage({
      highlight: highlight,
      articleContext: articleContext,
      input: instructions,
      name: "tunnel",
    })
  }
  async function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter") {
      if (event.shiftKey) return
      event.preventDefault()
      handleSend(input)
      setInput("")
      setIsVisible(false)
    } else if (event.key === "Escape") {
      setIsVisible(false)
    }
  }

  const adjustTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"
    }
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    adjustTextAreaHeight()
  }

  const style = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    maxWidth: "480px",
    width: "100%",
    boxSizing: "border-box",
  }

  const textAreaStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    resize: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    lineHeight: "1.5",
    overflow: "hidden",
  }

  return (
    isVisible && (
      <div style={style} ref={modalRef} className="chatbox-modal">
        <div
          style={{
            margin: "auto",
            textAlign: "center",
          }}
        >
          GPT Tunnel
        </div>
        <textarea
          style={textAreaStyle}
          ref={textAreaRef}
          rows={1}
          placeholder="Send text here"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={input}
        ></textarea>
      </div>
    )
  )
}

export default ChatBox

export async function renderChatBox(
  highlight?: string,
  articleContext?: string
) {
  const hostDiv = document.createElement("div")
  document.body.appendChild(hostDiv)

  const shadowRoot = hostDiv.attachShadow({ mode: "open" })
  const styleSlot = document.createElement("section")
  shadowRoot.appendChild(styleSlot)

  const root = createRoot(shadowRoot)

  root.render(<ChatBox highlight={highlight} articleContext={articleContext} />)
}
