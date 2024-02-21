import React from "react"
import { createRoot } from "react-dom/client"
import { SetupModal } from "./SetupModal"

const container = document.getElementById("setup-root")
const root = createRoot(container!)
root.render(<SetupModal />)
