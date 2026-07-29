import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4 px-page-x py-section">
      <h1 className="text-display text-primary">Home</h1>

      <p>
        I'm Priscila Santos, a Front-End AI Engineering Intern building
        production React and Next.js applications with AI as a development
        partner — not just for code, but for planning, testing, and
        documentation too.
      </p>

      <p>
        Ask my AI assistant about my projects and engineering approach, or
        jump straight into my{" "}
        <Link href="/work">case studies</Link>.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/ai"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try the AI Assistant
        </Link>

        <Link
          href="https://calendly.com/priscila-s-santos-ba/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rin"
        >
          Schedule a Meeting
        </Link>
      </div>
    </section>
  );
}