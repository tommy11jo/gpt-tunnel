import React, { useEffect, useState } from "react"

// Command + Shift + X for mac
// Ctrl + Shift + X for windows
const isMac = navigator.platform.toUpperCase().includes("MAC")
const defaultCmdConfig = {
  key: "X",
  ctrl: !isMac,
  meta: isMac,
  shift: true,
  alt: false,
}
export const loadCmdConfig = async (): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["cmdConfig"], (result) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        reject(chrome.runtime.lastError)
      }

      resolve(result.cmdConfig ? result.cmdConfig : defaultCmdConfig)
    })
  })
}
export const SetupModal: React.FC = () => {
  const [cmdConfig, setCmdConfig] =
    useState<Record<string, any>>(defaultCmdConfig)
  const [editShortcutMode, setEditShortcutMode] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await loadCmdConfig()
        setCmdConfig(config)
      } catch (error) {
        console.error("Failed to load command configuration:", error)
      }
    }

    fetchConfig()
  }, [])
  const cmdConfigToString = (cmdConfig: Record<string, any>) => {
    let cmds = []
    if (cmdConfig["ctrl"]) cmds.push("Ctrl")
    if (cmdConfig["meta"]) cmds.push(isMac ? "Command" : "Win")
    if (cmdConfig["alt"]) cmds.push("Alt")
    if (cmdConfig["shift"]) cmds.push("Shift")
    cmds.push(cmdConfig["key"].toLowerCase())
    return cmds.join(" + ")
  }
  const handleKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation()
    const cmdConfig = {
      key: e.key,
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    }
    setCmdConfig(cmdConfig)
  }
  useEffect(() => {
    if (editShortcutMode) {
      document.addEventListener("keydown", handleKeyDown)
    } else {
      document.removeEventListener("keydown", handleKeyDown)
    }
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editShortcutMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditShortcutMode(true)
  }

  const saveKeyCommand = () => {
    chrome.storage.local.set({ cmdConfig: cmdConfig })
    setEditShortcutMode(false)
  }

  const cmdConfigStr = cmdConfigToString(cmdConfig)
  return (
    <div
      style={{
        minWidth: "300px",
        margin: "auto",
        padding: "20px",
        fontSize: "18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          margin: "auto",
          textAlign: "center",
        }}
      >
        GPT Tunnel
      </div>
      <hr className="hr-line" />
      <span>
        Press <code>{cmdConfigStr}</code> to open the command palette
      </span>
      {!editShortcutMode ? (
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            style={{ display: "block", margin: "20px auto" }}
          >
            Enter New Key Command
          </button>
          <span style={{ display: "block", margin: "20px auto" }}>
            If you change the key command, be sure to reload the current
            webpage.
          </span>
        </form>
      ) : (
        <div>
          <span>Recording key command...</span>
          <button
            onClick={saveKeyCommand}
            style={{ display: "block", margin: "20px auto" }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}
