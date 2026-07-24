import { cn } from "@/lib/utils";

export type LeadScore = {
  company: string;
  score: number;
  priority: "Low" | "Medium" | "High";
  recommendation: string;
};

type LeadScoreCardProps = {
  result: LeadScore;
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-emerald-100 text-emerald-800",
} as const;

export function LeadScoreCard({ result }: LeadScoreCardProps) {
  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Lead score
          </p>
          <h3 className="mt-1 font-semibold text-slate-900">{result.company}</h3>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            priorityStyles[result.priority]
          )}
        >
          {result.priority} priority
        </span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[6rem_1fr] sm:items-center">
        <div className="rounded-lg bg-slate-900 p-3 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Score</p>
          <p className="mt-1 text-3xl font-bold leading-none">{result.score}</p>
          <p className="mt-1 text-xs text-slate-300">out of 100</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recommended next step
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-700">
            {result.recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}
