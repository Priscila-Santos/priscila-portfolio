// app/about/page.tsx
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

const technologies = [
  "React", "TypeScript", "Next.js", "Tailwind CSS",
  "JavaScript", "Java (Spring Boot)", "SQL", "Git",
];

export default function AboutPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Image
            src="/assets/priscila-portrait.png"
            alt="Priscila Santos"
            width={120}
            height={120}
            className="rounded-full border border-border object-cover"
          />
          <div className="space-y-2">
            <h1 className="text-h1 font-title text-primary">About</h1>
            <p className="max-w-2xl text-muted-foreground">
              I build frontend applications and treat AI as a collaborator I'm
              responsible for supervising — not a shortcut around engineering
              judgment.
            </p>
          </div>
        </header>

        <div className="space-y-8 text-sm leading-6 text-foreground">
          <p>
            I'm Priscila Santos, an Information Systems student at the Federal
            University of the Recôncavo da Bahia and a Front-End AI
            Engineering Intern at FlyRank AI. I build with React, TypeScript,
            and Java, and every project I ship documents the decisions behind
            it — not just the result.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-primary">Background</h2>
            <p className="mt-2">
              I combine coursework in Information Systems with real internship
              deliverables at FlyRank AI — this portfolio, and the AI agent
              running inside it, are part of that work, not a side project.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">How I work with AI</h2>
            <p className="mt-2">
              AI proposes, I decide. In practice: I plan architecture before
              generating any code, review every AI suggestion before it lands
              in a project, and iterate on prompts instead of accepting the
              first output. The final implementation call is always mine — my{" "}
              <Link href="/work" className="underline underline-offset-4">
                case studies
              </Link>{" "}
              show that process project by project, including where AI got
              something wrong and I caught it.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">Technologies</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="blue">{tech}</Badge>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground">
              Deploying and shipping on Vercel, end to end.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">Values</h2>
            <p className="mt-2">
              I don't ship what I can't explain. I validate AI output instead
              of trusting it by default, and I write documentation that makes
              my decisions legible to whoever reads them next — including a
              future hiring manager.
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Let&apos;s connect
        </Link>
      </div>
    </Section>
  );
}