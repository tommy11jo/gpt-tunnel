import React from "react"

export const SetupModal: React.FC = () => {
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
      <span>Press Command + Shift + X to open the command pallette</span>
    </div>
  )
}
