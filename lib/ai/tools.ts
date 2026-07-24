import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";

const scoreLeadInputSchema = z.object({
  company: z.string().min(1).describe("The lead's company name."),
  employees: z
    .number()
    .int()
    .nonnegative()
    .describe("The number of employees at the company."),
});

type LeadPriority = "Low" | "Medium" | "High";

function getPriority(score: number): LeadPriority {
  if (score >= 75) {
    return "High";
  }

  if (score >= 45) {
    return "Medium";
  }

  return "Low";
}

function getRecommendation(priority: LeadPriority): string {
  switch (priority) {
    case "High":
      return "Prioritize a personalized outreach sequence and schedule discovery quickly.";
    case "Medium":
      return "Add the lead to a targeted nurture sequence and qualify the use case.";
    case "Low":
      return "Keep the lead in a light-touch nurture campaign until stronger buying signals appear.";
  }
}

/**
 * Server-side tools available to the portfolio assistant.
 * Tool execution stays in this module so it is never exposed to the browser.
 */
export const portfolioTools = {
  scoreLead: tool({
    description:
      "Scores a sales lead from its company name and employee count. Use when a visitor asks to score or prioritize a lead.",
    inputSchema: scoreLeadInputSchema,
    execute: async ({ company, employees }) => {
      if (company === "error") {
        throw new Error("The lead scoring service could not score this company.");
      }

      // A deterministic demo score: larger organizations receive more points,
      // while the cap keeps the dashboard scale easy to interpret.
      const score = Math.min(100, Math.round(15 + Math.log10(employees + 1) * 30));
      const priority = getPriority(score);

      return {
        company,
        score,
        priority,
        recommendation: getRecommendation(priority),
      };
    },
  }),
};

export type PortfolioChatMessage = UIMessage<
  unknown,
  Record<string, never>,
  InferUITools<typeof portfolioTools>
>;
