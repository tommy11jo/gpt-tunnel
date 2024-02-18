export type ActionHandler = (
  articleText: string,
  highlight?: string,
  input?: string
) => void

export type Action = {
  name: string
  label: string
  key: string
  allowInput: boolean
  handler: ActionHandler
}

function customChatHandler(
  articleText: string,
  highlight?: string,
  input?: string
) {
  if (!articleText || !input) {
    throw new Error("Invalid custom chat action args")
  }
  let prompt = ""
  if (highlight) {
    prompt = `Respond to the user's prompt which likely refers to their selected highlight which is part of the article text they are reading.
ARTICLE: ${articleText}
HIGHLIGHT: ${highlight}
PROMPT: ${input}
`
  } else {
    prompt = `Respond to the user's prompt which likely refers to the article text they are reading.
ARTICLE: ${articleText}
PROMPT: ${input}
`
  }
  chrome.runtime.sendMessage({
    prompt: prompt,
    name: "tunnel",
  })
}

function explainHandler(
  articleText: string,
  highlight?: string,
  input?: string
) {
  if (!articleText || !highlight) {
    throw new Error("Invalid explain action args")
  }
  const prompt = `Casually and concisely explain the text I'm highlighting in the context of the article I'm reading. Act like every word costs you.
ARTICLE: ${articleText}
HIGHLIGHT: ${highlight}`
  chrome.runtime.sendMessage({
    prompt: prompt,
    name: "tunnel",
  })
}
function ytSummaryHandler(
  articleText: string,
  highlight?: string,
  input?: string
) {
  throw new Error("not implemented")
}

const chat: Action = {
  name: "custom_chat",
  label: "Custom Chat",
  key: "KeyC",
  allowInput: true,
  handler: customChatHandler,
}
const explain: Action = {
  name: "explain",
  label: "Explain",
  key: "KeyE",
  allowInput: false,
  handler: explainHandler,
}

const ytSummary: Action = {
  name: "youtube_summary",
  label: "YouTube Summary",
  key: "KeyY",
  allowInput: false,
  handler: ytSummaryHandler,
}

const actions = [chat, explain, ytSummary]
export default actions
