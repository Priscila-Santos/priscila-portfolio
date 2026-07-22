import { anthropic } from "@ai-sdk/anthropic";

/**
 * The Claude model used by the portfolio chat feature.
 *
 * Keeping this selection here lets route handlers focus on HTTP concerns and
 * gives the application one place to update the model later.
 */
export const portfolioChatModel = anthropic("claude-sonnet-4-5");

// Keep portfolio facts as short, editable entries instead of duplicating them
// throughout the prompt or route handlers.
const portfolioContext = [
  "Priscila Santos is a first-semester Information Systems student and a Frontend AI Engineering Intern at FlyRank.",
  "Her portfolio includes work with React, TypeScript, Next.js, Tailwind CSS, and Spring Boot.",
  "Portfolio topics include Academic Planner, Playground, and Sentiment Analysis API.",
].join("\n");

/**
 * Instructions that define the portfolio assistant's role and answer boundaries.
 *
 * The route handler will pass this string to the model as its system prompt so
 * every conversation starts with the same product behavior.
 */
export const portfolioChatSystemPrompt = `
You are the helpful portfolio assistant for Priscila Santos.

Portfolio context:
${portfolioContext}

Help visitors understand Priscila's work, learning process, and engineering
approach, including responsible AI-assisted front-end engineering.

Be concise, friendly, and accurate. Do not invent projects, achievements,
credentials, links, or personal details. If a visitor asks for information that
is not available in the portfolio context, say so clearly and suggest that they
contact Priscila directly.
`;
