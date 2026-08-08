import Link from "next/link";

type CaseStudy = {
  title: string;
  stack: string;
  aiRole: "AI-powered feature" | "AI-assisted development";
  problem: string;
  whatIDid: string[];
  outcome: string;
  link?: { label: string; href: string };
};

const caseStudies: CaseStudy[] = [
  {
    title: "This Portfolio",
    stack: "Next.js · TypeScript · Tailwind CSS · Vercel AI SDK",
    aiRole: "AI-powered feature",
    problem:
      "Most developer portfolios list technologies and projects but don't give a hiring manager enough evidence to see how the developer thinks, makes decisions, or uses AI responsibly.",
    whatIDid: [
      "Defined a proof statement, a specific audience, and a single call to action, then designed a sitemap where every page supports that goal.",
      "Built a streaming AI assistant on this site using the Vercel AI SDK and Claude: server-side tool calls, incremental rendering, accessible live-region updates, and explicit error/retry states.",
      "Used AI as a thinking partner throughout planning, not just for code: challenging my sitemap, reviewing information architecture, and pressure-testing whether each page actually connects to the interview CTA.",
    ],
    outcome:
      "A portfolio built around evidence instead of claims, with a working example of AI-assisted engineering (this chat feature) as one of the pieces of evidence itself.",
    link: { label: "Ask the AI assistant", href: "/ai" },
  },
  {
    title: "3D Model Viewer",
    stack: "React Three Fiber · @react-three/drei · leva · Next.js",
    aiRole: "AI-assisted development",
    problem:
      "FE-AA2 asked for a shipped, interactive 3D experience in the browser — not a demo screenshot — that loads responsibly and works on a phone, not just a desktop with a GPU to spare.",
    whatIDid: [
      "Built a drag-and-drop GLB viewer: drop any .glb file onto the canvas and it auto-centers, auto-scales, and stages itself with environment lighting and soft contact shadows via drei's Stage component.",
      "Added a live configurator (leva) for base color, metalness, roughness, a wireframe toggle, environment preset, and auto-rotate speed, applied by traversing the loaded scene graph's materials.",
      "Kept the 3D vendor bundle (three.js + fiber + drei + leva) out of every other page by lazy-loading the canvas with next/dynamic (ssr: false), and gated it behind a static, zero-motion fallback that respects prefers-reduced-motion and a best-effort low-power/data-saver check.",
    ],
    outcome:
      "A working, mobile-usable 3D scene (touch orbit/zoom via drei's OrbitControls) with an explicit performance budget instead of an unbounded one — documented with real bundle-size and frame-rate notes in the project README.",
    link: { label: "Open the 3D Lab", href: "/lab/3d" },
  },
  {
    title: "Academic Planner App",
    stack: "React",
    aiRole: "AI-assisted development",
    problem:
      "For my Algorithm Design I course, I needed a way to help students organize assignments, exams, and deadlines in one place. I also set myself a personal bar beyond the course requirement: a full React application balancing usability, organization, and maintainable code.",
    whatIDid: [
      "Designed and built the app with reusable components, organizing the interface around a student's daily workflow rather than around technical features.",
      "Made the navigation, task organization, and responsive layout decisions myself.",
      "Used AI throughout development to brainstorm implementation approaches, review code, troubleshoot issues, and improve documentation, while keeping the final engineering decisions mine.",
    ],
    outcome:
      "Demonstrates taking an idea from planning through implementation, balancing technical requirements with user experience, and using AI to accelerate development without replacing my own problem-solving.",
    link: {
      label: "View repository",
      href: "https://github.com/Priscila-Santos/Academico-Planner-App",
    },
  },
  {
    title: "AI Task Manager",
    stack: "React · Vite · GitHub Copilot",
    aiRole: "AI-assisted development",
    problem:
      "A homework assignment built specifically to show how AI can be used as a development assistant throughout a project's lifecycle, not just as a code generator.",
    whatIDid: [
      "Used Copilot for architecture planning first (folder structure, state management, data model) before writing any code.",
      "Implemented CRUD, search, filters, and Local Storage persistence with custom hooks (useLocalStorage, useTasks).",
      "Had Copilot perform a structured code review afterward — accessibility, performance, code smells — and used it to recommend the most valuable Vitest/RTL tests, not just any tests.",
      "Manually fixed a missing stylesheet import Copilot's review missed, and redesigned the task-statistics section into cards myself.",
    ],
    outcome:
      "Full prompt history and reflection are documented in the repo. My role was to guide the AI, validate its output, and take responsibility for the final implementation.",
    link: {
      label: "View repository",
      href: "https://github.com/Priscila-Santos/AI-task-manager",
    },
  },
];

export default function WorkPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-display text-primary">Work</h1>
          <p className="max-w-2xl text-muted-foreground">
            Case studies covering the Plan, Build, Test, and Document phases —
            what the problem was, what I did, and what came out of it.
          </p>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Two kinds of AI show up here: projects where AI is a{" "}
            <strong>feature of the product</strong> (like this portfolio&apos;s AI
            assistant, with tool calls and a grounding check), and projects where
            AI is a <strong>development assistant</strong> I used to plan, review,
            and test code I&apos;m still fully responsible for (Academic Planner,
            AI Task Manager). I keep those distinct below.
          </p>
        </header>

        <div className="space-y-8">
          {caseStudies.map((study) => (
            <article
              key={study.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-card-foreground">
                  {study.title}
                </h2>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {study.stack}
                </span>
                <span className="rounded-full bg-blue-soft px-2 py-0.5 text-xs font-medium text-blue-accent">
                  {study.aiRole}
                </span>
              </div>

              <div className="mt-4 space-y-4 text-sm leading-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Problem
                  </h3>
                  <p className="mt-1 text-card-foreground">{study.problem}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    What I did
                  </h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-card-foreground">
                    {study.whatIDid.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Outcome
                  </h3>
                  <p className="mt-1 text-card-foreground">{study.outcome}</p>
                </div>
              </div>

              {study.link && (
                <Link
                  href={study.link.href}
                  className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {study.link.label} →
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}