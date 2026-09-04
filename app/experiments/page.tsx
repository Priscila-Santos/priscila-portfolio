import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Experiments | Portfolio",
  description:
    "A curated area for interface experiments, interaction studies, and 3D web prototypes — Priscila Santos's front-end experimentation space.",
};

type ExperimentArea = {
  title: string;
  href: string;
  tagline: string;
  description: string;
  stack: string[];
  explored: string[];
  cta: string;
};

const areas: ExperimentArea[] = [
  {
    title: "Playground",
    href: "/playground",
    tagline: "Interface & interaction experiments",
    description:
      "A space for testing ideas before they become full case studies: accessible component internals, motion and state design, and comparisons against off-the-shelf UI libraries.",
    stack: ["React", "TypeScript", "Tailwind CSS"],
    explored: [
      "Focus traps, ARIA, and keyboard navigation built by hand",
      "Comparing hand-built components against shadcn/ui equivalents",
      "A button that narrates its own async lifecycle",
    ],
    cta: "Explore the Playground",
  },
  {
    title: "3D Lab",
    href: "/lab/3d",
    tagline: "Interactive 3D on the web",
    description:
      "A focused extension of the Playground into WebGL: a drag-and-drop model viewer built with an explicit performance budget instead of an unbounded one.",
    stack: ["React Three Fiber", "@react-three/drei", "leva"],
    explored: [
      "Loading a 3D vendor bundle responsibly (fallback-first, opt-in)",
      "A live material configurator applied across a scene graph",
      "Respecting prefers-reduced-motion and low-power devices",
    ],
    cta: "Open the 3D Lab",
  },
];

export default function ExperimentsPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-4">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Experiments" }]} />

          <header className="space-y-2">
            <h1 className="text-h1 font-title text-primary">Experiments</h1>
            <p className="max-w-2xl text-muted-foreground">
              Two connected spaces where I test ideas before they become full
              projects: interface and interaction studies in the{" "}
              <strong className="text-foreground">Playground</strong>, and
              interactive 3D on the web in the{" "}
              <strong className="text-foreground">3D Lab</strong>. Same
              curiosity, different medium.
            </p>
          </header>
        </div>

        <div className="space-y-6">
          {areas.map((area) => (
            <article
              key={area.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {area.title}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-accent">
                    {area.tagline}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {area.stack.map((tech) => (
                    <Badge key={tech} variant="blue" className="font-code normal-case tracking-normal">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-card-foreground">
                {area.description}
              </p>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                  What I explored
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-card-foreground">
                  {area.explored.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <Link
                href={area.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {area.cta}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Looking for finished, shipped work instead?{" "}
          <Link href="/work" className="font-medium text-primary underline-offset-4 hover:underline">
            View case studies →
          </Link>
        </p>
      </div>
    </Section>
  );
}