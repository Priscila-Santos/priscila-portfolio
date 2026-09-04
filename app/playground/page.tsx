"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Modal from "./components/ui/Modal";
import Tabs from "./components/ui/Tabs";
import Disclosure from "./components/ui/Disclosure";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

type ExperimentCardProps = {
  title: string;
  description: string;
  stack: string[];
  children: React.ReactNode;
};

function ExperimentCard({ title, description, stack, children }: ExperimentCardProps) {
  return (
    <article className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
        <div className="flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <Badge key={tech} variant="blue" className="font-code normal-case tracking-normal">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

export default function PlaygroundPage() {
  const [open, setOpen] = useState(false);

  return (
    <Section>
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Experiments", href: "/experiments" },
              { label: "Playground" },
            ]}
          />

          <header className="space-y-2">
            <h1 className="text-h1 font-title text-primary">Playground</h1>
            <p className="max-w-2xl text-muted-foreground">
              A collection of small front-end experiments and interaction
              studies, built to test ideas and learn by shipping working
              things — not polished case studies. This page exists because
              understanding what a headless UI library does internally
              (focus traps, ARIA, keyboard nav) is only provable by building
              those pieces by hand first, then comparing.
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Full comparison notes against shadcn/ui equivalents:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                app/playground/NOTES.md
              </code>
              .
            </p>
          </header>
        </div>

        <div className="space-y-6">
          <ExperimentCard
            title="Modal Dialog"
            description="A hand-built dialog with a manual focus trap, Escape handling, and return-focus-on-close — the interaction logic a headless library like Base UI hides inside node_modules."
            stack={["React", "Focus management", "ARIA"]}
          >
            <Button type="button" onClick={() => setOpen(true)}>
              Open Modal
            </Button>

            <Modal
              open={open}
              onClose={() => setOpen(false)}
              title="Delete Project"
              description="This action cannot be undone."
            >
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </div>
            </Modal>
          </ExperimentCard>

          <ExperimentCard
            title="Tabs"
            description="Full arrow-key/Home/End keyboard navigation implemented explicitly, so it's readable top-to-bottom in one file instead of living inside a headless package."
            stack={["React", "Keyboard navigation"]}
          >
            <Tabs
              tabs={[
                { id: "general", label: "General", content: <p>General information.</p> },
                { id: "projects", label: "Projects", content: <p>Projects content.</p> },
                { id: "contact", label: "Contact", content: <p>Contact information.</p> },
              ]}
            />
          </ExperimentCard>

          <ExperimentCard
            title="Disclosure"
            description="A minimal expand/collapse pattern with correct aria-expanded and aria-controls wiring, used as the baseline before touching any AI-generated or library version."
            stack={["React", "ARIA"]}
          >
            <Disclosure title="What technologies do you use?">
              <ul className="list-disc pl-6">
                <li>React</li>
                <li>TypeScript</li>
                <li>Next.js</li>
                <li>Tailwind CSS</li>
              </ul>
            </Disclosure>
          </ExperimentCard>

          <ExperimentCard
            title="Motion & State (FE-AA1)"
            description="A button that narrates its own lifecycle — idle, loading, success, and error — through deliberate durations and easings instead of an abrupt state swap."
            stack={["React", "Framer-style motion", "Tailwind CSS"]}
          >
            <Link
              href="/playground/motion-button"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View demo
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </ExperimentCard>
        </div>

        <p className="text-sm text-muted-foreground">
          Looking for something more visual?{" "}
          <Link href="/lab/3d" className="font-medium text-primary underline-offset-4 hover:underline">
            Check the 3D Lab →
          </Link>
        </p>
      </div>
    </Section>
  );
}