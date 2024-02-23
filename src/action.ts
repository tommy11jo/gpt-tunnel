export type ActionHandler = (
  articleText: string,
  highlight?: string,
  input?: string
) => void

export enum PromptContext {
  ArticleContext = "ArticleContext",
  HighlightContext = "HighlightContext",
}

export type Action = {
  name: string
  label: string
  key: string
  allowInput: boolean
  promptContexts: PromptContext[] // contexts under which this Action is possible to run (during highlight or no highlight)
  emoji: string
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
  const prompt = `Casually and concisely explain the text I'm highlighting in the context of the article I'm reading. Act like every word costs you. Do not repeat info clearly explained in the article text.
ARTICLE: ${articleText}
HIGHLIGHT: ${highlight}`
  chrome.runtime.sendMessage({
    prompt: prompt,
    name: "tunnel",
  })
}

function stylizeHandler(
  articleText: string,
  highlight?: string,
  input?: string
) {
  const prompt = `Stylize the TEXT according to the STYLE DESCRIPTION. Keep the content unchanged. Output the text directly.
TEXT: ${highlight}
STYLE DESCRIPTION: ${input}`
  chrome.runtime.sendMessage({
    prompt: prompt,
    name: "tunnel",
  })
}

function keyPointsHandler(
  articleText: string,
  highlight?: string,
  input?: string
) {
  const prompt = `Summarize the text in 3-5 key points. Reference concrete examples and be concise and casual, like texting. Act like every word costs you.
    Text: ${articleText}
`
  chrome.runtime.sendMessage({
    prompt: prompt,
    name: "tunnel",
  })
}

const chat: Action = {
  name: "custom_chat",
  label: "Custom Chat",
  emoji: "💬",
  key: "KeyC",
  promptContexts: [
    PromptContext.ArticleContext,
    PromptContext.HighlightContext,
  ],
  allowInput: true,
  handler: customChatHandler,
}
const explain: Action = {
  name: "explain",
  label: "Explain",
  key: "KeyE",
  emoji: "💡",
  promptContexts: [PromptContext.HighlightContext],
  allowInput: false,
  handler: explainHandler,
}

const keyPoints: Action = {
  name: "key_points",
  label: "Key Points",
  key: "KeyK",
  emoji: "🔑",
  promptContexts: [PromptContext.ArticleContext],
  allowInput: false,
  handler: keyPointsHandler,
}

const stylize: Action = {
  name: "stylize",
  label: "Stylize",
  emoji: "🎨",
  key: "KeyS",
  promptContexts: [PromptContext.HighlightContext],
  allowInput: true,
  handler: stylizeHandler,
}
const actions = [chat, explain, keyPoints, stylize]
export default actions
