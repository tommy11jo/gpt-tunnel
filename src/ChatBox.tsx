import React, { useRef, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import actions, { Action, PromptContext } from "./action"
import "./ChatBox.css"

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

  const legalActions = actions.filter(
    (action) =>
      (action.promptContexts.includes(PromptContext.HighlightContext) &&
        highlight) ||
      (PromptContext.ArticleContext && !highlight)
  )
  return (
    isVisible && (
      <div className="chatbox-modal" ref={modalRef}>
        <div
          style={{
            margin: "auto",
            textAlign: "center",
          }}
        >
          GPT Tunnel
        </div>
        <hr className="hr-line" />
        {showTextArea && (
          <textarea
            className="chatbox-textarea"
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
          <div className="chatbox-button-container">
            {legalActions.map((action, index) => (
              <button
                key={index}
                className="chatbox-button"
                onClick={() => triggerAction(action)}
              >
                <div className="chatbox-button-content">
                  <div style={{ display: "flex", gap: "4px" }}>
                    <span>{action.emoji}</span>
                    <span>{action.label}</span>
                  </div>
                  <br />
                  <span style={{ opacity: 0.7 }}>
                    Press {action.key.substring(3)}
                  </span>
                </div>
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
