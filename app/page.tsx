import Link from "next/link";

import { ShaderHero } from "@/features/hero/components/shader-hero";

export default function HomePage() {
  return (
    <>
      <ShaderHero>
        <div className="space-y-4 px-page-x py-section text-white">
          <h1 className="text-display drop-shadow-sm">Home</h1>

          <p className="max-w-xl text-white/90 drop-shadow-sm">
            I&apos;m Priscila Santos, a Front-End AI Engineering Intern building
            production React and Next.js applications with AI as a development
            partner — not just for code, but for planning, testing, and
            documentation too.
          </p>

          <p className="max-w-xl text-white/90 drop-shadow-sm">
            Ask my AI assistant about my projects and engineering approach, or
            jump straight into my{" "}
            <Link href="/work" className="underline underline-offset-4">
              case studies
            </Link>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ai"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try the AI Assistant
            </Link>

            <Link
              href="https://calendly.com/priscila-s-santos-ba/30min"
              className="text-sm text-white/80 underline underline-offset-4 hover:text-white"
            >
              or schedule a call directly
            </Link>
          </div>
        </div>
      </ShaderHero>
    </>
  );
}