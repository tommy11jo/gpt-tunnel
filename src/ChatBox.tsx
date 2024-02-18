import React, { useRef, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import actions, { Action } from "./action"
type ChatBoxProps = {
  highlight?: string
  articleContext?: string
}
const ChatBox: React.FC<ChatBoxProps> = ({ highlight, articleContext }) => {
  const [input, setInput] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [curAction, setCurAction] = useState<Action | null>(null)
  const [showActionMenu, setShowActionMenu] = useState(true)
  const [showTextArea, setShowTextArea] = useState(false)

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

  const actionKeyListener = (event: KeyboardEvent) => {
    const action = actions.find((action) => event.code === action.key)
    if (action) {
      triggerAction(action)
    }
  }
  useEffect(() => {
    if (showActionMenu) {
      document.addEventListener("keydown", actionKeyListener)
    } else {
      document.removeEventListener("keydown", actionKeyListener)
    }
    return () => {
      document.removeEventListener("keydown", actionKeyListener)
    }
  }, [showActionMenu])

  function triggerAction(action: Action) {
    setCurAction(action)
    if (action.allowInput) {
      setShowTextArea(true)
      setTimeout(() => {
        if (textAreaRef.current) textAreaRef.current.focus()
        else throw new Error("textarea ref should be present")
      }, 0)
      setShowActionMenu(false)
    } else {
      // TODO: make this mandatory, not optional
      action.handler(articleContext || "", highlight)
      setIsVisible(false)
    }
  }

  async function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter") {
      if (event.shiftKey) return
      event.preventDefault()
      if (!curAction)
        throw new Error(
          "Cur action should not be null when action initiated with ENTER"
        )
      // TODO
      curAction.handler(articleContext || "", highlight, input)
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
    backgroundColor: "rgba(20, 20, 20, 0.7)",
    backdropFilter: "blur(10px)",
    // border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    maxWidth: "480px",
    width: "100%",
    boxSizing: "border-box",
    color: "#fff",
  }

  const textAreaStyle = {
    width: "100%",
    padding: "8px",
    border: "none",
    outline: "none",
    backgroundColor: "#222",
    borderRadius: "4px",
    resize: "none",
    boxSizing: "border-box",
    fontSize: "14px",
    lineHeight: "1.5",
    overflow: "hidden",
    color: "#fff",
  }

  const buttonStyle = {
    padding: "8px 16px",
    margin: "0 8px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    outline: "none",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
  }

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 0",
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
        {showTextArea && (
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
        )}
        {showActionMenu && (
          <div style={buttonContainerStyle}>
            {actions.map((action, index) => (
              <button
                key={index}
                style={buttonStyle}
                onClick={() => triggerAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
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

  const root = createRoot(hostDiv)

  root.render(<ChatBox highlight={highlight} articleContext={articleContext} />)
}
