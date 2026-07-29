# Priscila's Portfolio

A modern portfolio built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and the **Vercel AI SDK** to showcase both my technical projects and my work as a **Front-end AI Engineering Intern at FlyRank**.

Rather than serving as only a portfolio website, this repository documents how I use AI responsibly throughout the software development lifecycle—from planning and implementation to testing, debugging, and documentation.

The `/work` page contains detailed case studies describing the engineering decisions behind each feature.

---

## Live Demo

> [Deployed Vercel URL](https://priscila-portfolio.vercel.app/)

---

## Features

- Responsive portfolio built with Next.js 14 App Router
- AI-powered streaming chat assistant
- Server-side AI tools using the Vercel AI SDK
- Typed tool definitions with Zod
- Structured UI rendering for tool lifecycle states
- Accessible, reusable React components
- A reusable async lifecycle button (idle → loading → success/error) with intentional motion
- Tailwind CSS design system
- TypeScript throughout the project

---

# AI Lead-Scoring Tool

The portfolio assistant includes a server-side tool called `scoreLead`.

Instead of generating a free-form answer, the language model can invoke this tool to calculate a deterministic lead score based on the provided company information.

The tool executes exclusively on the server through the chat API route.

## Tool Contract

### Name

`scoreLead`

### Description

Scores a sales lead based on company size and returns a structured recommendation.

### Input Schema

```ts
{
  company: string;
  employees: number;
}
```

### Return Shape

```ts
{
  company: string;
  score: number;
  priority: "Low" | "Medium" | "High";
  recommendation: string;
}
```

### Example Prompt

```
Score Acme with 500 employees.
```

### Example Response

```
Company: Acme

Score: 92

Priority: High

Recommendation:
Contact within 24 hours.
```

---

## Tool Lifecycle

The chat interface renders each stage of the AI SDK tool lifecycle with its own visual component instead of displaying raw JSON.

| State | Description |
|--------|-------------|
| Input Streaming | Tool arguments are still being generated |
| Input Available | Tool inputs have been generated and execution is starting |
| Output Available | Structured results are rendered as a dashboard card |
| Output Error | Errors are displayed in a dedicated error component without crashing the application |

For testing purposes, sending:

```
company = "error"
```

forces the tool to throw an exception so the error state can be verified.

---

# Buttons with a Brain (FE-AA1)

A reusable button component, `AsyncActionButton`, that communicates its full
lifecycle through motion instead of an abrupt swap: **idle → hover/focus →
loading → success/error → idle**.

Live demo: [`/playground/motion-button`](https://priscila-portfolio.vercel.app/playground/motion-button)

## Component Contract

### Name

`AsyncActionButton`

### Location

`components/ui/async-action-button.tsx`

### Presets

`components/ui/lifecycle-button-presets.tsx` exports `SendButton` and
`DeployButton` — two different actions built on the same component, proving
the motion language (durations, easings, layout strategy) is one shared
system rather than two separate implementations.

### Input Props

```ts
{
  onAction: () => Promise<void>;
  icon: ReactNode;
  idleLabel: string;
  loadingLabel: string;
  successLabel: string;
  errorLabel?: string;
  disabled?: boolean;
  holdMs?: number; // how long success/error holds before resetting to idle
}
```

## States

| State | Trigger | Description |
|---|---|---|
| Idle | Default | Rest state, shows icon + label |
| Hover / focus | Pointer or keyboard focus | Lifts 2px, shadow eases in (150ms) |
| Active | Mouse/keyboard press | Compresses slightly (100ms, fast ease-in) |
| Loading | Click fires `onAction` | Label cross-fades to a spinner; button disables itself so repeat clicks can't fire overlapping requests |
| Success | `onAction` resolves | Icon morphs to a checkmark with a small overshoot; auto-returns to idle after 1.4s |
| Error | `onAction` rejects | Button shakes once, switches to a "Retry" label and destructive color; auto-returns to idle after 1.4s |
| Disabled | `disabled` prop | Dimmed, non-interactive, no hover/press motion |

Every transition animates only `transform`/`opacity` (no layout thrash), and
`motion-safe:`/`motion-reduce:` variants ensure `prefers-reduced-motion`
removes the glide/shake/spin/pop while keeping the color and label feedback
intact.

## Duration & Easing Notes

- **Hover 150ms / press 100ms** — opposite easing curves (ease-out lift vs.
  ease-in press) so they read as distinct gestures.
- **Content cross-fade 200ms** (`cubic-bezier(0.4,0,0.2,1)`) — idle/loading
  layers swap on two absolutely-positioned layers inside a fixed-width
  button, so nothing reflows.
- **Spinner 700ms linear, infinite** — deliberately not eased; a spinner has
  no start/end to accelerate toward.
- **Success check 320ms** (`cubic-bezier(0.34,1.56,0.64,1)`) — slight
  overshoot so it reads as rewarding.
- **Error shake 420ms ease-in-out** — short and sharp, doesn't delay the
  "Retry" label being readable.
- **Auto-return to idle: 1.4s hold.**

The full write-up, plus live triggers for success and forced failure, is on
the demo page itself at `/playground/motion-button`.

### Example Usage

```tsx
import { SendButton } from "@/components/ui/lifecycle-button-presets";

<SendButton
  onAction={() => sendMessage({ text }).then(() => setInput(""))}
  disabled={!input.trim()}
/>
```

---

## Project Structure

```
app/
  api/
    chat/
      route.ts
      tools.ts
  playground/
    motion-button/
      page.tsx

components/
  chat/
  tools/
  ui/
    async-action-button.tsx
    lifecycle-button-presets.tsx

lib/
```

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

## Development-only state triggers

The following hooks are enabled only while running `npm run dev`. They are ignored in a production build and do not call the model provider, so each UI state can be demonstrated safely.

| State | Chat trigger phrase | Query parameter alternative | Result |
|---|---|---|---|
| Route error | `trigger route error` | `/ai?test=route-error` | Throws in the AI route and displays the `error.tsx` Recover boundary. |
| Mid-stream failure | `trigger stream error` | `/api/chat?test=stream-error` | Sends a partial assistant response, then interrupts the AI SDK stream. |
| HTTP rate limit | `trigger rate limit` | `/api/chat?test=rate-limit` | Returns HTTP 429 with `Retry-After`. |
| Network-like timeout | `trigger timeout` | `/api/chat?test=timeout` | Waits five seconds to expose the skeleton, then returns HTTP 504. |
| Malformed tool response | `trigger malformed tool response` | `/api/chat?test=malformed-tool` | Emits an invalid `scoreLead` result through the AI SDK UI-message stream. |

For the API query-parameter forms, use a REST client or temporarily configure the chat transport endpoint. The phrase forms work directly from the portfolio assistant.

The motion button's success/failure states don't need a dev-only trigger —
`/playground/motion-button` has always-on forced-success and forced-failure
buttons, plus a random-outcome (20% failure) pair, so evaluators can see
every state without special setup.

---

## Learning Goals

This project was developed as part of the FlyRank AI Engineering Internship.

It demonstrates practical experience with:

- AI-assisted frontend engineering
- Streaming user interfaces
- Server-side AI tool execution
- Structured generative UI
- Type-safe APIs with Zod
- Production-oriented React architecture
- Human-in-the-loop AI workflows
- Intentional micro-interaction design (state-driven motion, reduced-motion support)

---

## License

This project is available under the MIT License.
