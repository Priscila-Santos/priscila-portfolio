import { LeadScoreCard, type LeadScore } from "@/features/chat/components/lead-score-card";

type ScoreLeadToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

type PortfolioToolName = "listProjects" | "readProject" | "checkGrounding";

type ToolInvocationProps = {
  state: ScoreLeadToolState;
  input: unknown;
  output?: unknown;
};

type LeadInput = {
  company: string;
  employees: number;
};

type ProjectInput = {
  slug: string;
};

function isProjectInput(value: unknown): value is ProjectInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "slug" in value &&
    typeof value.slug === "string"
  );
}

function formatProjectName(slug: string): string {
  return slug
    .replace(/^project-/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isLeadInput(value: unknown): value is LeadInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "company" in value &&
    "employees" in value &&
    typeof value.company === "string" &&
    typeof value.employees === "number"
  );
}

function isLeadScore(value: unknown): value is LeadScore {
  return (
    typeof value === "object" &&
    value !== null &&
    "company" in value &&
    "score" in value &&
    "priority" in value &&
    "recommendation" in value &&
    typeof value.company === "string" &&
    typeof value.score === "number" &&
    (value.priority === "Low" || value.priority === "Medium" || value.priority === "High") &&
    typeof value.recommendation === "string"
  );
}

function LeadInputSummary({ input }: { input: unknown }) {
  if (!isLeadInput(input)) {
    return <p className="text-sm text-current">Preparing lead details…</p>;
  }

  return (
    <p className="text-sm text-current">
      {input.company} <span aria-hidden="true">·</span> {input.employees.toLocaleString()} employees
    </p>
  );
}

function LeadScoreSkeleton({ input }: { input: unknown }) {
  return (
    <section
      aria-busy="true"
      aria-label="Preparing lead score"
      className="mt-3 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm"
    >
      <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Lead score</p>
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-emerald-200" />
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[6rem_1fr] sm:items-center">
        <div className="h-[5.5rem] animate-pulse rounded-lg bg-slate-200" />
        <div>
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted [animation-delay:150ms]" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted [animation-delay:300ms]" />
        </div>
      </div>
      {isLeadInput(input) && (
        <div className="border-t border-emerald-100 px-4 py-2 text-xs text-slate-600">
          <LeadInputSummary input={input} />
        </div>
      )}
    </section>
  );
}

/** Renders the AI SDK tool protocol as deliberate, human-readable UI states. */
export function ToolInvocation({ state, input, output }: ToolInvocationProps) {
  if (state === "input-streaming") {
    return <LeadScoreSkeleton input={input} />;
  }

  if (state === "input-available") {
    return <LeadScoreSkeleton input={input} />;
  }

  if (state === "output-available") {
    if (isLeadScore(output)) {
      return <LeadScoreCard result={output} />;
    }

    return (
      <section className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
        Lead scoring returned an unexpected result.
      </section>
    );
  }

  if (state === "output-error") {
    return (
      <section className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900" role="alert">
        <p className="text-sm font-semibold">Lead scoring could not be completed</p>
        <p className="mt-1 text-sm text-red-800">
          Please try again with another company.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      Lead scoring is awaiting confirmation.
    </section>
  );
}

/** Shows lightweight progress only while portfolio grounding tools are running. */
export function PortfolioToolInvocation({
  toolName,
  state,
  input,
}: {
  toolName: PortfolioToolName;
  state: ScoreLeadToolState;
  input: unknown;
}) {
  if (state !== "input-streaming" && state !== "input-available") {
    return null;
  }

  const label =
    toolName === "listProjects"
      ? "Finding relevant projects…"
      : toolName === "readProject"
        ? `Reading project: ${isProjectInput(input) ? formatProjectName(input.slug) : "…"}`
        : "Checking answer grounding…";

  return (
    <p
      aria-live="polite"
      className="mt-3 inline-flex rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground"
    >
      {label}
    </p>
  );
}
