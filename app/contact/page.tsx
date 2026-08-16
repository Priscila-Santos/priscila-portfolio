import { Mail, Link2, FileText, Download } from "lucide-react";

const contactLinks = [
  {
    label: "Email",
    value: "priscila.santos.psds@gmail.com",
    href: "mailto:priscila.santos.psds@gmail.com",
    icon: Mail,
    external: false,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/priscilasdsantos/",
    href: "https://www.linkedin.com/in/priscilasdsantos/",
    icon: Link2,
    external: true,
  },
  {
    label: "GitHub",
    value: "github.com/Priscila-Santos",
    href: "https://github.com/Priscila-Santos",
    icon: Link2,
    external: true,
  },
  {
    label: "Resume",
    value: "View resume (PDF)",
    // Served from /public/assets/resume.pdf — same origin, no third-party
    // link to keep valid. Opens the PDF directly in the browser tab.
    href: "/assets/resume.pdf",
    icon: FileText,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-h1 font-title text-primary">Get in Touch</h1>
          <p className="max-w-xl text-muted-foreground">
            If you&apos;re looking for a frontend engineer who uses AI
            thoughtfully, communicates engineering decisions clearly, and
            enjoys building practical software, I&apos;d welcome the chance to
            talk about my projects and approach in a technical interview.
          </p>
        </header>

        <dl className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          {contactLinks.map((link) => (
            <div
              key={link.label}
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
            >
              <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {link.label}
              </dt>
              <dd className="flex items-center gap-2">
                <link.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {link.value}
                  {link.external && (
                    <span className="sr-only"> (opens in a new tab)</span>
                  )}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        {/* Explicit download action, separate from the "view" link above —
            gives a recruiter a one-click download without first opening
            the PDF viewer if that's what they'd rather do. */}
        <a
          href="/assets/resume.pdf"
          download="Priscila-Santos-Resume.pdf"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download resume (PDF)
        </a>

        <p className="text-sm text-muted-foreground">
          Information Systems student and Front-End AI Engineering Intern at FlyRank AI — open to conversations about frontend or AI-assisted engineering roles.
        </p>
      </div>
    </section>
  );
}