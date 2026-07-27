import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-display text-primary">About</h1>
          <p className="max-w-2xl text-muted-foreground">
            Clear, practical, curious, and evidence-first — how I got here and
            how I work.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-6 text-foreground">
          <p>
            I&apos;m Priscila Santos, an Information Systems student at the
            Federal University of the Recôncavo da Bahia and a Front-End AI
            Engineering Intern at FlyRank AI. I build web applications using
            React, TypeScript, and Java, using AI as a development partner for
            planning, implementation, debugging, testing, and documentation.
          </p>

          <p>
            I enjoy turning ideas into practical software and documenting the
            engineering decisions behind each project, so others can
            understand not just what I built, but why I built it that way.
          </p>

          <div>
            <h2 className="text-lg font-semibold text-primary">Background</h2>
            <p className="mt-2">
              I&apos;m currently studying Information Systems while working as
              a Front-End AI Engineering Intern at FlyRank AI, where I combine
              coursework with real internship deliverables — including this
              portfolio itself.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">
              How I work with AI
            </h2>
            <p className="mt-2">
              I treat AI as a collaborator, not a replacement for engineering
              judgment. In practice that means: planning architecture before
              generating code, reviewing every AI suggestion before it lands
              in a project, refining prompts iteratively rather than accepting
              the first output, and keeping the final implementation decisions
              mine. My{" "}
              <Link href="/work" className="underline underline-offset-4">
                case studies
              </Link>{" "}
              walk through this process project by project.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">
              Technologies
            </h2>
            <p className="mt-2">
              React, TypeScript, Next.js, Tailwind CSS, JavaScript, HTML/CSS,
              Java (Spring Boot), SQL, and Git — plus hands-on experience
              deploying with Vercel.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary">Values</h2>
            <p className="mt-2">
              Understand a tool well enough to explain it before shipping it.
              Validate AI output instead of trusting it by default. Write
              documentation that makes engineering decisions legible to
              someone else — including a future hiring manager.
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
    </section>
  );
}