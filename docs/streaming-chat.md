# Streaming Portfolio Chat: Developer Guide

This guide explains the AI chat feature in Priscila Santos's portfolio. It is written for a junior frontend engineer who wants to understand both the React UI and the server-side streaming flow.

> **Note on this revision:** an earlier draft of this doc described the
> assistant as a simple prompt-stuffed chat calling Anthropic Claude at
> `/api/chat`. The feature that actually shipped is a tool-using **agent**
> (grounded in local markdown sources, with a self-check step) calling
> **Google Gemini** at `/api/portfolio-agent`. This revision documents the
> real, deployed implementation. See `week-five/ASSIGNMENT_COACH.md` and
> `week-six/EXPLAIN_MY_CODE.md` for the full reasoning behind that design.
>
> **Second revision note:** the assistant's grounding sources used to live
> in their own copy at `content/portfolio/*.md`, entirely separate from
> the case studies rendered on `/work` (`content/work/*.md`). That meant
> every project's facts had to be kept in sync by hand across two places.
> `lib/ai/portfolio-sources.ts` now reads project sources from the same
> `content/work/*.md` files the Work page uses (via
> `lib/work/case-studies.ts`'s `CaseStudyProvider`), so there is exactly
> one place to edit a project's facts and the assistant can't answer
> something that contradicts what's shown on `/work`. Only bio content
> (`content/portfolio/about.md`) remains separate, since it isn't a
> project and doesn't belong on the Work page.

## 1. Architecture overview

The feature is split into small layers, each with one responsibility:

```text
Browser
  app/ai/page.tsx
    -> features/chat/components/chat-interface.tsx
      -> POST /api/portfolio-agent
        -> app/api/portfolio-agent/route.ts
          -> lib/rate-limit.ts               (per-IP request cap, before any model call)
          -> lib/ai/portfolio-agent.ts        (system prompt + decision loop)
          -> lib/ai/portfolio-agent-tools.ts  (listProjects / readProject / checkGrounding / scoreLead)
            -> lib/ai/portfolio-sources.ts    (unifies content/work/*.md + content/portfolio/about.md)
              -> lib/work/case-studies.ts     (CaseStudyProvider — same source app/work/page.tsx reads)
          -> Google Gemini (via @ai-sdk/google)
```

- The **page** places the feature in the portfolio and supplies page metadata.
- The **client chat component** collects input, renders messages, and consumes the stream.
- The **API route** is the server boundary. It rate-limits and caps input *before* spending any model tokens, validates the request, and starts the model request.
- The **rate limiter** rejects abusive traffic (HTTP 429) or oversized conversations (HTTP 413) before conversion or streaming ever starts.
- The **agent module** owns the system prompt and the tool-driven decision loop: identify source → read source → draft → check grounding → revise once if needed → finalize.
- **Google Gemini** generates the response and decides when to call a tool. Its API key remains on the server.

This separation is useful because a visual change normally stays in the client component, while a model, prompt, or tool change stays in the `lib/ai/` modules. The route does not need to know about button styling, and the browser never needs the API key.

## 2. Relevant folder structure

```text
app/
  ai/page.tsx                             # Route and metadata for /ai
  api/portfolio-agent/route.ts            # Server POST endpoint: rate limit -> input caps -> streamText
  work/page.tsx                           # /work route — also reads lib/work/case-studies.ts

features/
  chat/components/
    chat-interface.tsx                    # Interactive chat UI and scrolling logic
    chat-message.tsx                      # One user or assistant message, plus tool-call rendering
    tool-invocation.tsx                   # Renders each tool's lifecycle state (loading/result/error)

lib/
  ai/
    portfolio-chat.ts                     # Gemini model selection
    portfolio-agent.ts                    # System prompt + grounding decision loop
    portfolio-agent-tools.ts              # listProjects / readProject / checkGrounding / scoreLead
    portfolio-sources.ts                  # Unifies content/work/*.md (case studies) + content/portfolio/about.md as grounding sources
  work/
    case-studies.ts                       # CaseStudyProvider — reads content/work/*.md, also used by app/work/page.tsx
  rate-limit.ts                           # Per-IP request cap
  utils.ts                                # Shared class-name utility

content/work/*.md                         # Case study grounding source, shared with the Work page (single source of truth)
content/portfolio/about.md                # Bio grounding source

components/
  ui/button.tsx                           # Reusable accessible button primitive

.env.example                              # Documents required local environment variable
```

## 3. Request lifecycle

1. A visitor enters text in the textarea on `/ai`.
2. `handleSubmit` prevents the browser's normal form navigation.
3. The component trims the text and rejects an empty submission or a second submission while a response is generating.
4. `sendMessage({ text })`, supplied by AI SDK's `useChat`, adds the user message to client state and sends the conversation to `/api/portfolio-agent` through `DefaultChatTransport`.
5. The route checks the caller's rate limit (`lib/rate-limit.ts`) before doing anything else. Over the limit → HTTP `429` with a `Retry-After` header, and the model is never called.
6. The route reads the JSON body and checks the conversation isn't larger than the input caps (40 messages, 4,000 characters per message). Too large → HTTP `413`.
7. `convertToModelMessages` converts the UI-friendly message structure into model messages suitable for the provider.
8. `streamText` starts the Gemini request with the system prompt, message history, and the four portfolio-agent tools, capped at 5 steps (`stopWhen: stepCountIs(5)`) so the tool-calling loop can't run indefinitely.
9. If Gemini decides it needs a fact, it calls `listProjects` or `readProject` mid-stream; the client renders a lightweight progress label for each (see §7, `tool-invocation.tsx`).
10. Before finalizing, the agent may call `checkGrounding` (at most twice) to verify its draft against the source content it read.
11. `toUIMessageStreamResponse()` turns the model stream — including tool calls and their results — into the AI SDK protocol understood by `useChat`.
12. The browser receives chunks and React rerenders as `messages` changes.

## 4. Streaming lifecycle

Streaming means the browser receives partial answer data before Gemini has finished the whole answer.

1. After submission, `useChat` changes `status` to `"submitted"`.
2. The UI displays the thinking indicator because no assistant text exists yet.
3. When the server sends the first text chunk, `useChat` adds or updates the assistant message and `status` becomes `"streaming"`.
4. More chunks update that same assistant message. React rerenders its text incrementally. Tool calls arrive as their own message parts and render through `tool-invocation.tsx` rather than as plain text.
5. The scroll effect follows those updates only when the visitor is near the bottom of the conversation.
6. When the stream ends, `status` returns to its non-generating state and the Stop button becomes Send again.
7. If the visitor presses Stop, AI SDK aborts the active client request. Any text already received remains visible.

The browser does not wait for a complete JSON response. Instead, the AI SDK transport understands the stream format returned by `toUIMessageStreamResponse()`.

## 5. AI SDK overview

The project uses the Vercel AI SDK packages below:

- `@ai-sdk/react` provides `useChat`, a React hook that owns chat state and streaming updates.
- `ai` provides `DefaultChatTransport`, request/message helpers, `streamText`, `stepCountIs`, and the UI streaming response helper.
- `@ai-sdk/google` provides the `google()` model factory used to call Gemini.

`useChat` is intentionally used instead of manually managing a `fetch` call, a `ReadableStream`, message merging, loading state, and abort controllers. It provides those common chat responsibilities while the feature retains control over rendering and design.

## 6. Model and agent overview

`lib/ai/portfolio-chat.ts` creates the configured Gemini model with:

```ts
google("gemini-3.5-flash-lite")
```

`lib/ai/portfolio-agent.ts` supplies the system prompt and decision loop, and `lib/ai/portfolio-agent-tools.ts` supplies four tools:

| Tool | Purpose |
|---|---|
| `listProjects` | Lists available portfolio/bio sources when the visitor doesn't name one directly |
| `readProject` | Reads one source's full markdown content by slug |
| `checkGrounding` | Deterministic word-overlap check of a draft answer against the source it was read from |
| `scoreLead` | Computes a deterministic lead score from a company name and employee count |

The route passes the model and these tools to `streamText`, capped at 5 steps total. Gemini decides on its own whether it needs to call a tool, and if so, which one — this is why the feature is described as an **agent** rather than a fixed workflow: nothing in the route hardcodes "always call `listProjects` first."

Model provider was switched from Anthropic to Google Gemini specifically because the assignment's "completely free construction platform" constraint rules out a paid Anthropic key — see `week-five/BUILD_LOG.md` (Session 2) for the full reasoning.

`listProjects` and `readProject` are backed by `lib/ai/portfolio-sources.ts`, which itself pulls project data from `lib/work/case-studies.ts` — the same `CaseStudyProvider` that renders `/work`. Only the bio source (`about`) is read from a separate file, `content/portfolio/about.md`.

## 7. Component guide

### `app/ai/page.tsx`

This is a Server Component by default. It defines metadata and renders the client chat interface. It has no client state and does not handle secrets.

### `features/chat/components/chat-interface.tsx`

This is the main interactive component and begins with `"use client"`. It:

- owns textarea and scroll-following state;
- initializes the AI SDK transport, pointed at `/api/portfolio-agent`;
- sends messages and renders streamed message history;
- shows thinking, error, Send, and Stop states;
- implements auto-scroll and Jump to latest;
- supplies the chat feature's accessibility semantics.

### `features/chat/components/chat-message.tsx`

This presentational component receives one AI SDK `UIMessage`. It extracts text parts and renders known tool-call parts (`scoreLead`, `listProjects`, `readProject`, `checkGrounding`) through `tool-invocation.tsx`; it returns nothing for a message with no visible content. Keeping this separate prevents the parent component from becoming harder to read.

### `features/chat/components/tool-invocation.tsx`

Renders each tool's lifecycle (`input-streaming` / `input-available` / `output-available` / `output-error`) as a small, human-readable UI element instead of raw JSON — a busy skeleton for `scoreLead` in progress, a card for its result, and a lightweight "Reading project: …" style label for the grounding tools while they run.

### `app/api/portfolio-agent/route.ts`

This App Router route handles `POST /api/portfolio-agent`. Route handlers run on the server, so they are the correct place to contact Gemini. In order, it: checks the rate limit, checks the input-size caps, converts messages, invokes `streamText` with the agent's tools, and returns the stream. It also sets `export const maxDuration = 30;` so a slow tool call or model response can't hang a request indefinitely.

### `lib/ai/portfolio-chat.ts`

This module is the single configuration point for the Gemini model. Centralizing it avoids repeating provider configuration across route handlers.

### `lib/ai/portfolio-agent.ts` and `lib/ai/portfolio-agent-tools.ts`

These own, respectively, the system prompt/decision loop and the tool implementations (including the `checkGrounding` word-overlap heuristic). Splitting them keeps the "how the agent should behave" text separate from "what each tool actually does."

### `lib/ai/portfolio-sources.ts` and `lib/work/case-studies.ts`

`case-studies.ts` owns the `CaseStudyProvider` interface and its markdown implementation, reading `content/work/*.md` for the Work page. `portfolio-sources.ts` adapts that same data into the shape the agent's tools expect, and adds the separate bio source. Keeping the adapter in its own file means the agent's tools never depend on the Work page's rendering concerns, while still sharing one underlying data source.

### `lib/rate-limit.ts`

An in-memory, per-IP sliding-window limiter (see §9 below) used only by the route — it has no UI counterpart, since a blocked request never reaches the model or the chat UI's normal error path.

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

- `messages`: UI message history, including incremental assistant text and tool-call parts.
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
| `messages` | `useChat` | Conversation history, streamed output, and tool-call parts |
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

The component additionally checks whether the latest assistant message already contains text. The thinking indicator is shown only while a request is generating **and** no assistant text has appeared. This prevents flicker when the status changes from submitted to streaming: the indicator stays visible until the first useful token replaces it. Note that a tool call in progress (e.g. `readProject` running) also counts as "generating" without visible text yet, so the visitor sees the tool's own progress label instead of a blank gap.

The dots are decorative (`aria-hidden="true"`). The meaningful text uses `role="status"` while it is visible, so assistive technology can announce "Thinking…" without interruption.

## 13. Stop button

While a response is generating, the Send button is replaced with **Stop**. It calls `stop` from `useChat`.

Stopping aborts the active browser request; it does not delete text already received. This is important when a response is too long, off-topic, or no longer needed. The button uses `type="button"` so it does not accidentally submit the form, and it has the specific accessible label "Stop generating response."

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
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
```

For local development:

1. Copy `.env.example` to `.env.local`.
2. Add the real key (from Google AI Studio's free tier) to `.env.local`.
3. Restart the Next.js development server after changing environment variables.

`.env.local` is ignored by Git and must never be committed. Do not prefix this variable with `NEXT_PUBLIC_`: that prefix makes variables available to browser code. The Google Generative AI SDK reads the key only when called from the server-side route through `lib/ai/portfolio-chat.ts`.

## 16. Deploying to Vercel

1. Push the repository to the connected Git provider.
2. Import the repository into Vercel.
3. In **Project Settings → Environment Variables**, add `GOOGLE_GENERATIVE_AI_API_KEY`.
4. Select the environments that need it, typically Production and Preview. Add Development only if using Vercel's cloud development environment.
5. Deploy or redeploy after saving the variable.
6. Open `/ai` in the deployed site and complete a real streaming test, including a question that should trigger a tool call (e.g. "tell me about the 3D viewer project").

Never place the key in client-side source code, `NEXT_PUBLIC_*` variables, a committed `.env` file, or a browser request header.

## 17. Testing checklist

### Core and streaming

- [ ] Send a normal question and confirm user and assistant messages render in order.
- [ ] Ask something that should trigger `readProject`/`listProjects` and confirm a tool progress label appears before the final text.
- [ ] Throttle the network in browser DevTools and confirm text appears incrementally.
- [ ] Confirm Thinking appears immediately and disappears after the first assistant text.
- [ ] Send a second question after completion.
- [ ] Test a malformed request body against `/api/portfolio-agent` and confirm it returns `400`.
- [ ] Send more than 40 messages (or one longer than 4,000 characters) and confirm the route returns `413` instead of calling the model.
- [ ] Send more than 8 requests in a minute from the same client and confirm the route returns `429` with a `Retry-After` header.
- [ ] Ask about a project that exists on `/work` and confirm the assistant's answer doesn't contradict the case study shown there.

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

### `No HTTP methods exported in '.../route.ts'` and the request returns `405`

Next.js couldn't find a recognized method export (`GET`, `POST`, etc.) in the route file. In practice this almost always means:

- The export isn't exactly `export async function POST(...)` — check capitalization (`Post`/`post` won't be picked up) and that `export` wasn't accidentally dropped while editing.
- The file isn't at the exact path Next.js expects: `app/api/portfolio-agent/route.ts` (not `.tsx`, not nested one folder too deep or shallow).
- A stale `.next` cache from before the file was last edited. Stop the dev server and clear it:
  ```bash
  rm -rf .next
  npm run dev
  ```
  (PowerShell: `Remove-Item -Recurse -Force .next`)

### The route returns a Google Generative AI authentication error

Check that `GOOGLE_GENERATIVE_AI_API_KEY` exists in `.env.local` locally or in Vercel environment settings after deployment. Restart the local server after changing it. Confirm it is not named `NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY`.

### The browser receives no streamed text

Use the Network tab to inspect the `POST /api/portfolio-agent` response. Confirm the route returns `result.toUIMessageStreamResponse()` and the client transport targets `/api/portfolio-agent`. Also check server logs for provider errors.

### Thinking never disappears

Check whether the route is returning an error before the first text chunk. Inspect the browser Network response and the server terminal. The client shows the generic error alert when `useChat` receives a failed request.

### A message that should be answerable gets a 413

Check its length against `MAX_MESSAGE_CHARS` (4,000) and the conversation length against `MAX_MESSAGES` (40) in `app/api/portfolio-agent/route.ts`. Adjust those constants if the caps are too tight for real usage — they exist to block abuse, not to constrain a normal visitor.

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

### A project shown on /work isn't found by the assistant, or vice versa

Since both now read from `content/work/*.md` (via `lib/work/case-studies.ts`), a mismatch usually means a case study file is missing required frontmatter (`title`, `stack`) that `MarkdownCaseStudyProvider` can't parse, or the file lives outside `content/work/`. Check `lib/ai/portfolio-sources.ts`'s `listPortfolioSources()` output directly (e.g. with a temporary log) if in doubt.

## 19. Future improvements

- Add a retry action for failed requests.
- Move rate limiting from the current in-memory, per-instance limiter (`lib/rate-limit.ts`) to a shared store (e.g. Upstash Redis) for real multi-instance guarantees at scale.
- Persist conversations only if there is a clear privacy policy and user value.
- Add analytics that records anonymous product events, not raw private chat content.
- Render safe Markdown for richer assistant answers.
- Replace `checkGrounding`'s word-overlap heuristic with a semantic check (a second model call), which would also fix its known false-positive on markdown heading lines (see `week-five/BUILD_LOG.md`, Session 5).
- Add a URL-fetch tool for external sources, scoped out of the MVP to keep grounding checks deterministic (see `week-five/BUILD_LOG.md`).
- Add Playwright end-to-end tests with a mocked streaming route for repeatable scrolling, tool-call rendering, and Stop-button checks.
- Consider reduced-motion preferences before adding any additional animation.
- Add provider-error logging and observability that redacts user messages and secrets.
- Move `content/portfolio/about.md` into the same `CaseStudyProvider`-style abstraction as case studies, so bio content also gets the same future migration path to an external source (Notion, Sanity, etc.) documented in `lib/work/case-studies.ts`.

The current implementation deliberately stays small: it demonstrates a real tool-using, self-checking agent, streaming AI interaction, user control over scrolling, accessible status feedback, production-hygiene guards (rate limiting, input caps, a request timeout), and server-only secret handling — without introducing unnecessary infrastructure.