# Priscila's Portfolio

A modern portfolio built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and the **Vercel AI SDK** to showcase both my technical projects and my work as a **Front-end AI Engineering Intern at FlyRank**.

Rather than serving as only a portfolio website, this repository documents how I use AI responsibly throughout the software development lifecycle—from planning and implementation to testing, debugging, and documentation.

The `/work` page contains detailed case studies describing the engineering decisions behind each feature.

---

## Live Demo

> Add your deployed Vercel URL here.

---

## Features

- Responsive portfolio built with Next.js 14 App Router
- AI-powered streaming chat assistant
- Server-side AI tools using the Vercel AI SDK
- Typed tool definitions with Zod
- Structured UI rendering for tool lifecycle states
- Accessible, reusable React components
- Tailwind CSS design system
- TypeScript throughout the project

---

## Tech Stack

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- Zod
- Server Components by default

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

## Project Structure

```
app/
  api/
    chat/
      route.ts
      tools.ts

components/
  chat/
  tools/

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

---

## License

This project is available under the MIT License.
