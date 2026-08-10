// app/page.tsx
import Link from "next/link";
import Image from "next/image";

import { ShaderHero } from "@/features/hero/components/shader-hero";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

const stack = ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vercel AI SDK"];

const proofPoints = [
  { label: "Case studies", value: "4" },
  { label: "AI agent built from scratch", value: "1" },
  { label: "Deployed on", value: "Vercel" },
];

function CodeCard() {
  return (
    <div className="hidden w-full max-w-sm rounded-lg border border-white/15 bg-black/40 font-code text-sm text-white/90 shadow-card backdrop-blur lg:block">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="ml-2 text-xs text-white/50">profile.ts</span>
      </div>
      <pre className="overflow-x-auto p-4 leading-6">
{`export const engineer = {
  name: "Priscila Santos",
  role: "Front-End AI Engineer",
  stack: [
    "React", "TypeScript",
    "Next.js", "Tailwind"
  ],
  approach: "AI proposes, I decide",
};`}
      </pre>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <ShaderHero>
        <div className="grid min-h-[50vh] items-center gap-8 px-page-x py-section lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-white">
            <div className="flex flex-wrap gap-2">
              {stack.map((tech) => (
                <Badge key={tech} variant="blue" className="bg-white/10 text-white backdrop-blur">
                  {tech}
                </Badge>
              ))}
            </div>

            <h1 className="max-w-2xl text-display font-title leading-tight drop-shadow-sm">
              I build AI-assisted frontend applications.
            </h1>

            <p className="max-w-xl text-white/90 drop-shadow-sm">
              Front-End AI Engineering Intern using AI as a development partner —
              not just for code, but for planning, testing, and documentation too.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/ai"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Try the AI Assistant
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View my work
              </Link>
            </div>
          </div>

          <div className="flex justify-end">
            <CodeCard />
          </div>
        </div>
      </ShaderHero>

      <Section className="border-b">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/priscila-portrait.png"
              alt="Priscila Santos"
              width={72}
              height={72}
              className="rounded-full border border-border object-cover"
            />
            <p className="max-w-sm text-sm text-muted-foreground">
              Information Systems student turning AI collaboration into
              maintainable, production-ready frontend work.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 text-center">
            {proofPoints.map((point) => (
              <div key={point.label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {point.label}
                </dt>
                <dd className="mt-1 text-h2 font-title text-primary">{point.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}