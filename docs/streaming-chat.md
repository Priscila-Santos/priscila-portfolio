# Streaming Portfolio Chat: Developer Guide

This guide explains the AI chat feature in Priscila Santos's portfolio. It is written for a junior frontend engineer who wants to understand both the React UI and the server-side streaming flow.

## 1. Architecture overview

The feature is split into small layers, each with one responsibility:

```text
Browser
  app/ai/page.tsx
    -> features/chat/components/chat-interface.tsx
      -> POST /api/chat
        -> app/api/chat/route.ts
          -> lib/ai/portfolio-chat.ts
            -> Anthropic Claude
```

- The **page** places the feature in the portfolio and supplies page metadata.
- The **client chat component** collects input, renders messages, and consumes the stream.
- The **API route** is the server boundary. It validates browser input and starts the model request.
- The **AI configuration module** centralizes the model choice and system prompt.
- **Anthropic Claude** generates the response. Its API key remains on the server.

This separation is useful because a visual change normally stays in the client component, while a model or prompt change stays in the AI module. The route does not need to know about button styling, and the browser never needs the API key.

## 2. Relevant folder structure

```text
app/
  ai/page.tsx                         # Route and metadata for /ai
  api/chat/route.ts                   # Server POST endpoint

features/
  chat/components/
    chat-interface.tsx                # Interactive chat UI and scrolling logic
    chat-message.tsx                  # One user or assistant message

lib/
  ai/portfolio-chat.ts                # Claude model and system prompt
  utils.ts                            # Shared class-name utility

components/
  ui/button.tsx                       # Reusable accessible button primitive

.env.example                          # Documents required local environment variable
```

## 3. Request lifecycle

1. A visitor enters text in the textarea on `/ai`.
2. `handleSubmit` prevents the browser's normal form navigation.
3. The component trims the text and rejects an empty submission or a second submission while a response is generating.
4. `sendMessage({ text })`, supplied by AI SDK's `useChat`, adds the user message to client state and sends the conversation to `/api/chat` through `DefaultChatTransport`.
5. The route reads JSON and checks that a `messages` field exists.
6. `validateUIMessages` checks the untrusted UI-message data at runtime. TypeScript alone cannot validate data received over HTTP.
7. `convertToModelMessages` converts the UI-friendly message structure into model messages suitable for the provider.
8. `streamText` starts the Claude request using the configured model, system prompt, and message history.
9. `toUIMessageStreamResponse()` turns the model stream into the AI SDK protocol understood by `useChat`.
10. The browser receives chunks and React rerenders as `messages` changes.

## 4. Streaming lifecycle

Streaming means the browser receives partial answer data before Claude has finished the whole answer.

1. After submission, `useChat` changes `status` to `"submitted"`.
2. The UI displays the thinking indicator because no assistant text exists yet.
3. When the server sends the first text chunk, `useChat` adds or updates the assistant message and `status` becomes `"streaming"`.
4. More chunks update that same assistant message. React rerenders its text incrementally.
5. The scroll effect follows those updates only when the visitor is near the bottom of the conversation.
6. When the stream ends, `status` returns to its non-generating state and the Stop button becomes Send again.
7. If the visitor presses Stop, AI SDK aborts the active client request. Any text already received remains visible.

The browser does not wait for a complete JSON response. Instead, the AI SDK transport understands the stream format returned by `toUIMessageStreamResponse()`.

## 5. AI SDK overview

The project uses the Vercel AI SDK packages below:

- `@ai-sdk/react` provides `useChat`, a React hook that owns chat state and streaming updates.
- `ai` provides `DefaultChatTransport`, request/message helpers, `streamText`, and the UI streaming response helper.
- `@ai-sdk/anthropic` provides the `anthropic()` model factory.

`useChat` is intentionally used instead of manually managing a `fetch` call, a `ReadableStream`, message merging, loading state, and abort controllers. It provides those common chat responsibilities while the feature retains control over rendering and design.

## 6. Claude streaming overview

`lib/ai/portfolio-chat.ts` creates the configured Claude model with:

```ts
anthropic("claude-sonnet-4-5")
```

The route passes that model to `streamText`. AI SDK then opens a server-to-provider request and exposes generated text as a readable stream. The route returns that stream immediately, allowing the client to render text as it arrives.

Claude receives two kinds of context:

- The **system prompt**, which establishes the portfolio assistant's role, factual boundaries, and tone.
- The **conversation messages**, which contain the visitor's current and previous questions.

The concise `portfolioContext` array keeps known portfolio facts in one editable location. It improves relevance while the instruction not to invent information prevents unsupported claims.

## 7. Component guide

### `app/ai/page.tsx`

This is a Server Component by default. It defines metadata and renders the client chat interface. It has no client state and does not handle secrets.

### `features/chat/components/chat-interface.tsx`

This is the main interactive component and begins with `"use client"`. It:

- owns textarea and scroll-following state;
- initializes the AI SDK transport;
- sends messages and renders streamed message history;
- shows thinking, error, Send, and Stop states;
- implements auto-scroll and Jump to latest;
- supplies the chat feature's accessibility semantics.

### `features/chat/components/chat-message.tsx`

This presentational component receives one AI SDK `UIMessage`. It extracts its text parts, returns nothing for a message with no visible text, and visually distinguishes user and assistant messages. Keeping this separate prevents the parent component from becoming harder to read.

### `app/api/chat/route.ts`

This App Router route handles `POST /api/chat`. Route handlers run on the server, so they are the correct place to contact Anthropic. It validates input, converts messages, invokes `streamText`, and returns the stream.

### `lib/ai/portfolio-chat.ts`

This module is the single configuration point for the Claude model, portfolio facts, and system prompt. Centralizing them avoids repeating provider configuration across route handlers.

## 8. Hooks explained

### `useState`

`input` stores the controlled textarea value. React rerenders when the visitor types, and the textarea always displays the state value.

`shouldAutoScroll` stores whether new streamed content should move the conversation. It starts as `true`, becomes `false` when the visitor scrolls away from the bottom, and returns to `true` after they jump back to the latest message.

### `useRef`

`scrollContainerRef` points to the actual scrolling `<div>`. Refs are appropriate here because `scrollTop`, `scrollHeight`, and `clientHeight` are DOM measurements, not data that needs to trigger rendering.

`bottomRef` points to an empty marker after the latest message. Calling `bottomRef.current?.scrollIntoView()` is a simple and reliable way to scroll to the newest content.

### `useMemo`

`useMemo` creates `DefaultChatTransport` once. Without it, every React render would create a new transport object, which is unnecessary and can make hook configuration unstable.

### `useEffect`

The auto-scroll effect runs after React paints changed messages or thinking state. If `shouldAutoScroll` is true, it smoothly scrolls the bottom marker into view. Effects are needed because scrolling changes the DOM after rendering; it is not something React should do while calculating JSX.

### `useChat`

`useChat` owns the chat protocol state:

- `messages`: UI message history, including incremental assistant text.
- `sendMessage`: sends a new user message through the configured transport.
- `status`: request lifecycle state, used for thinking and Stop UI.
- `stop`: aborts the active request.
- `error`: stores a failed request for the visible alert.

## 9. State management

The feature does not need a global store because all state belongs to one screen.

| State | Owner | Purpose |
|---|---|---|
| `input` | `ChatInterface` | Controlled textarea value |
| `shouldAutoScroll` | `ChatInterface` | Whether incoming chunks should move the viewport |
| `messages` | `useChat` | Conversation history and streamed output |
| `status` | `useChat` | Submitted/streaming/ready UI states |
| `error` | `useChat` | Failed request feedback |

This is local state management: the data lives as close as possible to the UI that uses it. It keeps the feature easy to understand and avoids a global state library for one isolated interaction.

## 10. Auto-scroll implementation

The conversation area has a bounded height and `overflow-y-auto`, allowing its messages to scroll without making the entire page grow indefinitely.

When the visitor scrolls, `handleConversationScroll` calculates:

```ts
distanceFromBottom = scrollHeight - scrollTop - clientHeight
```

- `scrollHeight` is the total height of all scrollable content.
- `scrollTop` is how far the visitor has scrolled from the top.
- `clientHeight` is the visible height of the container.

If the remaining distance is 80px or less, the component considers the visitor "near the bottom" and enables auto-scroll. The tolerance matters because streamed content changes height continuously and users should not need to land on an exact pixel.

If the visitor scrolls upward farther than that tolerance, auto-scroll is disabled. The effect then returns early, so new model tokens do not pull the reader away from older content.

Smooth scrolling is requested with `behavior: "smooth"`, which makes the movement easier to follow than a sudden jump.

## 11. Jump-to-latest implementation

The **Jump to latest** button renders only when:

- `shouldAutoScroll` is false; and
- at least one message exists.

It is positioned over the lower-right corner of the conversation panel so it remains available while the visitor reads older messages. Clicking it:

1. sets `shouldAutoScroll` to true; and
2. smoothly scrolls `bottomRef` into view.

This gives the visitor control. Automatic updates are convenient when following the conversation, but they should never override intentional scrolling.

## 12. Thinking indicator

`isGenerating` is true while AI SDK status is `"submitted"` or `"streaming"`.

The component additionally checks whether the latest assistant message already contains text. The thinking indicator is shown only while a request is generating **and** no assistant text has appeared. This prevents flicker when the status changes from submitted to streaming: the indicator stays visible until the first useful token replaces it.

The dots are decorative (`aria-hidden="true"`). The meaningful text uses `role="status"` while it is visible, so assistive technology can announce “Thinking…” without interruption.

## 13. Stop button

While a response is generating, the Send button is replaced with **Stop**. It calls `stop` from `useChat`.

Stopping aborts the active browser request; it does not delete text already received. This is important when a response is too long, off-topic, or no longer needed. The button uses `type="button"` so it does not accidentally submit the form, and it has the specific accessible label “Stop generating response.”

## 14. Accessibility decisions

- The conversation has `role="log"`, which describes a dynamic sequence of entries.
- `aria-live="polite"` asks screen readers to announce updates without interrupting the user.
- `aria-relevant="additions text"` and `aria-atomic="false"` favor changed/new content instead of treating the full conversation as one new announcement.
- `aria-busy` communicates that the log is still updating while the model responds.
- The textarea has a real associated label, even though it is visually hidden with `sr-only`.
- Errors use `role="alert"` so failures are announced promptly.
- Interactive controls are native buttons or a native textarea, so they work with keyboard navigation by default.
- The shared Button component and textarea include visible `focus-visible` styling.
- The Jump button appears only when it has an action to offer, avoiding an unnecessary tab stop.

Live-region behavior can differ between assistive technology and browser combinations. Test with at least NVDA plus Chrome or VoiceOver plus Safari before treating announcements as fully verified.

## 15. Environment variables

The required variable is:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

For local development:

1. Copy `.env.example` to `.env.local`.
2. Add the real key to `.env.local`.
3. Restart the Next.js development server after changing environment variables.

`.env.local` is ignored by Git and must never be committed. Do not prefix this variable with `NEXT_PUBLIC_`: that prefix makes variables available to browser code. The Anthropic SDK reads the key only when called from the server-side route through the AI configuration module.

## 16. Deploying to Vercel

1. Push the repository to the connected Git provider.
2. Import the repository into Vercel.
3. In **Project Settings → Environment Variables**, add `ANTHROPIC_API_KEY`.
4. Select the environments that need it, typically Production and Preview. Add Development if using Vercel's cloud development environment.
5. Deploy or redeploy after saving the variable.
6. Open `/ai` in the deployed site and complete a real streaming test.

Never place the key in client-side source code, `NEXT_PUBLIC_*` variables, a committed `.env` file, or a browser request header.

## 17. Testing checklist

### Core and streaming

- [ ] Send a normal question and confirm user and assistant messages render in order.
- [ ] Throttle the network in browser DevTools and confirm text appears incrementally.
- [ ] Confirm Thinking appears immediately and disappears after the first assistant text.
- [ ] Send a second question after completion.
- [ ] Test a malformed request body against `/api/chat` and confirm it returns `400`.

### Stop and errors

- [ ] Start a long response and press Stop after several chunks.
- [ ] Confirm partial text remains and a new question can be sent.
- [ ] Test with a missing/invalid key or offline connection and confirm the error alert appears.

### Scrolling

- [ ] At the bottom, request a long response and confirm streamed text is followed smoothly.
- [ ] Scroll upward while text is streaming and confirm the viewport stops moving.
- [ ] Confirm Jump to latest appears only after auto-scroll is disabled.
- [ ] Click it and confirm the conversation reaches the bottom, the button hides, and following resumes.
- [ ] Test both a short response that does not overflow and a long response that does.

### Responsive and accessibility

- [ ] Test 320px, 375px, and tablet-sized viewports in portrait and landscape.
- [ ] Verify the jump button does not obscure an important control.
- [ ] Navigate with keyboard only and confirm visible focus for textarea, Send/Stop, and Jump to latest.
- [ ] Test live announcements with a screen reader.
- [ ] Run an accessibility scan such as Axe as a helpful supplement, then manually verify its findings.

### Browser coverage

- [ ] Current Chrome and Edge.
- [ ] Current Firefox.
- [ ] Current Safari on macOS.
- [ ] Safari on iOS.

## 18. Common debugging scenarios

### The route returns an Anthropic authentication error

Check that `ANTHROPIC_API_KEY` exists in `.env.local` locally or in Vercel environment settings after deployment. Restart the local server after changing it. Confirm it is not named `NEXT_PUBLIC_ANTHROPIC_API_KEY`.

### The browser receives no streamed text

Use the Network tab to inspect the `POST /api/chat` response. Confirm the route returns `result.toUIMessageStreamResponse()` and the client transport targets `/api/chat`. Also check server logs for provider errors.

### Thinking never disappears

Check whether the route is returning an error before the first text chunk. Inspect the browser Network response and the server terminal. The client shows the generic error alert when `useChat` receives a failed request.

### Auto-scroll does not follow messages

Confirm the conversation itself overflows and that the visitor is within 80px of the bottom. If auto-scroll is paused, Jump to latest should be visible. Check that the bottom marker remains after all messages and the thinking/error UI.

### Auto-scroll keeps interrupting reading

Confirm the scroll event fires on the conversation container, not the page. The calculated distance must become greater than 80px after scrolling upward. Browser DevTools can inspect `scrollTop`, `scrollHeight`, and `clientHeight` on the container.

### Jump to latest is not visible

It intentionally appears only after there is at least one message and auto-scroll has been disabled. Create enough content to overflow the conversation, then scroll upward farther than the tolerance.

### TypeScript fails unexpectedly

Run:

```bash
npx tsc --noEmit
```

This checks all TypeScript and TSX files without generating application output. Fix the first reported error, then rerun it before deployment.

## 19. Future improvements

- Add a retry action for failed requests.
- Add server-side rate limiting and abuse protection before broad public exposure.
- Persist conversations only if there is a clear privacy policy and user value.
- Add analytics that records anonymous product events, not raw private chat content.
- Render safe Markdown for richer assistant answers.
- Add a maintained structured source of portfolio facts, such as project summaries, to improve grounding.
- Add Playwright end-to-end tests with a mocked streaming route for repeatable scrolling and Stop-button checks.
- Consider reduced-motion preferences before adding any additional animation.
- Add provider-error logging and observability that redacts user messages and secrets.

The current implementation deliberately stays small: it demonstrates streaming AI interaction, user control over scrolling, accessible status feedback, and server-only secret handling without introducing unnecessary infrastructure.
