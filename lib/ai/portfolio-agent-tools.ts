import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";
import { portfolioTools } from "./tools";
import {
  listPortfolioSources,
  readPortfolioSource,
} from "./portfolio-sources";

/**
 * Adapted from lib/ai/study-agent-tools.ts. Same word-overlap grounding
 * heuristic, with one deliberate improvement: markdown heading lines are
 * excluded before splitting into claims. This fixes the false-positive
 * documented in week-five/BUILD_LOG.md (Session 5), where a title line
 * like "# Study Notes: useEffect" was flagged as an unsupported claim
 * even though it's formatting, not a factual statement. Every other
 * claim was passing correctly, so the fix is narrow: skip heading lines,
 * don't touch the rest of the heuristic.
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at",
  "by", "for", "with", "about", "against", "between", "into", "through",
  "during", "before", "after", "above", "below", "to", "from", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "once",
  "here", "there", "all", "any", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "can", "will", "just", "should", "now", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "that", "this", "these", "those", "it", "its", "they", "them",
  "their", "you", "your", "use", "using", "used",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[`#*_~[\](){}]/g, " ")
      .split(/\W+/)
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
  );
}

/**
 * Splits an answer into claim-sized segments, skipping markdown heading
 * lines entirely (the fix mentioned above) before falling back to the
 * same line/sentence split used in the Study Notes Agent.
 */
function splitIntoClaims(answer: string): string[] {
  return answer
    .split(/\n+/)
    .filter((line) => !/^#{1,6}\s/.test(line.trim())) // skip "# Heading" lines
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/**
 * Same deterministic word-overlap heuristic as checkNotesGrounding in
 * study-agent-tools.ts: fast, cheap, debuggable — not semantic
 * verification. A real semantic check (a second model call comparing
 * claim to source) is the natural next iteration, same caveat as before.
 */
function checkAnswerGrounding(
  answer: string,
  sourceContent: string,
): { groundedRatio: number; unsupportedClaims: string[] } {
  const sourceTokens = tokenize(sourceContent);
  const claims = splitIntoClaims(answer);

  if (claims.length === 0) {
    return { groundedRatio: 1, unsupportedClaims: [] };
  }

  const unsupportedClaims: string[] = [];
  let supportedCount = 0;

  for (const claim of claims) {
    const claimTokens = [...tokenize(claim)];

    if (claimTokens.length === 0) {
      supportedCount += 1;
      continue;
    }

    const overlapCount = claimTokens.filter((token) => sourceTokens.has(token)).length;
    const overlapRatio = overlapCount / claimTokens.length;

    if (overlapRatio >= 0.35) {
      supportedCount += 1;
    } else {
      unsupportedClaims.push(claim);
    }
  }

  return {
    groundedRatio: supportedCount / claims.length,
    unsupportedClaims,
  };
}

export const portfolioAgentTools = {
  ...portfolioTools,

  listProjects: tool({
    description:
      "List all portfolio projects and bio pages available as grounding sources (slug, title, topic, stack).",
    inputSchema: z.object({}),
    execute: async () => listPortfolioSources(),
  }),

  readProject: tool({
    description:
      "Read the full markdown content of one portfolio project or bio page by slug.",
    inputSchema: z.object({
      slug: z.string().describe("Source filename without the .md extension"),
    }),
    execute: async ({ slug }) => {
      const source = await readPortfolioSource(slug);

      if (!source) {
        return {
          found: false as const,
          slug,
          message: `Source "${slug}" was not found. Use listProjects to see available slugs.`,
        };
      }

      return {
        found: true as const,
        slug: source.slug,
        title: source.title,
        content: source.content,
      };
    },
  }),

  checkGrounding: tool({
    description:
      "Check whether a draft answer about a portfolio project is grounded in that project's source content, using a deterministic word-overlap heuristic.",
    inputSchema: z.object({
      answer: z.string().describe("Draft answer to verify"),
      sourceSlug: z.string().describe("Slug of the project used as the source"),
    }),
    execute: async ({ answer, sourceSlug }) => {
      const source = await readPortfolioSource(sourceSlug);

      if (!source) {
        return {
          found: false as const,
          sourceSlug,
          message: `Source "${sourceSlug}" was not found.`,
          groundedRatio: 0,
          unsupportedClaims: [] as string[],
        };
      }

      const result = checkAnswerGrounding(answer, source.content);

      return {
        found: true as const,
        sourceSlug,
        sourceTitle: source.title,
        ...result,
      };
    },
  }),
};

export type PortfolioAgentMessage = UIMessage<
  unknown,
  Record<string, never>,
  InferUITools<typeof portfolioAgentTools>
>;
