import { LoaderCircle } from "lucide-react";

import { LeadScoreCard, type LeadScore } from "@/features/chat/components/lead-score-card";

type ScoreLeadToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

type ToolInvocationProps = {
  state: ScoreLeadToolState;
  input: unknown;
  output?: unknown;
  errorText?: string;
};

type LeadInput = {
  company: string;
  employees: number;
};

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

/** Renders the AI SDK tool protocol as deliberate, human-readable UI states. */
export function ToolInvocation({ state, input, output, errorText }: ToolInvocationProps) {
  if (state === "input-streaming") {
    return (
      <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Preparing lead score
        </p>
        <div className="mt-1 text-amber-800"><LeadInputSummary input={input} /></div>
      </section>
    );
  }

  if (state === "input-available") {
    return (
      <section className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950">
        <p className="text-sm font-semibold">Lead details ready for scoring</p>
        <div className="mt-1 text-sky-800"><LeadInputSummary input={input} /></div>
      </section>
    );
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
          {errorText || "Please try again with another company."}
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
