import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4 px-page-x py-section">
      <h1 className="text-display text-primary">Home</h1>
      <p>
        I build AI-assisted frontend applications. Try the AI assistant below to
        ask about my projects, or explore my <Link href="/work">case studies</Link>.
      </p>
      <Link
        href="/ai"
        className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Try the AI Assistant
      </Link>
    </section>
  );
}
