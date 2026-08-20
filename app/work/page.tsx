import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import Link from "next/link";

import { getCaseStudies } from "@/lib/work/case-studies";

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();

  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-h1 font-title text-primary">Selected Work</h1>
          <p className="max-w-2xl text-muted-foreground">
            Case studies covering the Plan, Build, Test, and Document phases —
            what the problem was, what I did, and what came out of it.
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Two kinds of AI show up here: projects where AI is a{" "}
            <strong>feature of the product</strong> (like this portfolio&apos;s AI
            assistant, with tool calls and a grounding check), and projects where
            AI is a <strong>development assistant</strong> I used to plan, review,
            and test code I&apos;m still fully responsible for (Academic Planner,
            AI Task Manager). I keep those distinct below.
          </p>
        </header>

        <div className="space-y-8">
          {caseStudies.map((study) => (
            <article
              key={study.slug}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {study.title}
                  </h2>
                  {study.aiRole && (
                    <Badge variant={study.aiRole === "AI-powered feature" ? "pink" : "blue"}>
                      {study.aiRole}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {study.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="neutral"
                      className="font-code normal-case tracking-normal"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-4 text-sm leading-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Problem
                  </h3>
                  <p className="mt-1 text-card-foreground">{study.problem}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    What I did
                  </h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-card-foreground">
                    {study.whatIDid.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Outcome
                  </h3>
                  <p className="mt-1 text-card-foreground">{study.outcome}</p>
                </div>
              </div>

              {study.link && (
                <Link
                  href={study.link.href}
                  className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {study.link.label} →
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}