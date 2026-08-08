const contactLinks = [
  { 
    label: "Email", 
    value: "priscila.santos.psds@gmail.com", 
    href: "mailto:priscila.santos.psds@gmail.com" 
  },
  { 
    label: "LinkedIn", 
    value: "linkedin.com/in/priscilasdsantos/", 
    href: "https://www.linkedin.com/in/priscilasdsantos/" },
  {
    label: "GitHub",
    value: "github.com/Priscila-Santos",
    href: "https://github.com/Priscila-Santos",
  },
  { 
    label: "Resume", 
    value: "Priscila-Santos-Resume", 
    href: "https://1drv.ms/b/c/a8ba1b696edd1899/IQCBFdZzwPdcQop1UhEFuGIsAfrEbfYfw_HxHJ7Yixfaikc?e=IczEDC" },
];

export default function ContactPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-display text-primary">Contact</h1>
          <p className="max-w-xl text-muted-foreground">
            If you&apos;re looking for a frontend engineer who uses AI
            thoughtfully, communicates engineering decisions clearly, and
            enjoys building practical software, I&apos;d welcome the chance to
            talk about my projects and approach in a technical interview.
          </p>
        </header>

        <dl className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          {contactLinks.map((link) => (
            <div key={link.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {link.label}
              </dt>
              <dd>
                <a
                  href={link.href}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {link.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-sm text-muted-foreground">
          Information Systems student and Front-End AI Engineering Intern at FlyRank AI — open to conversations about frontend or AI-assisted engineering roles.
        </p>
      </div>
    </section>
  );
}