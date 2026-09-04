import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ThreeDLabClient } from "@/app/lab/3d/three-d-lab-client";

export const metadata: Metadata = {
  title: "3D Model Viewer | Portfolio",
  description:
    "Drag-and-drop GLB viewer with a live material configurator, built with React Three Fiber.",
};

export default function ThreeDLabPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Experiments", href: "/experiments" },
            { label: "3D Lab" },
          ]}
        />

        <header className="space-y-2">
          <p className="text-sm font-medium text-accent">FE-AA2 · Build+</p>
          <h1 className="text-display text-primary">3D model viewer</h1>
          <p className="max-w-2xl text-muted-foreground">
            A focused extension of the{" "}
            <Link href="/playground" className="underline underline-offset-4 hover:text-foreground">
              Playground
            </Link>{" "}
            into interactive 3D on the web: a staged WebGL scene with orbit
            controls, environment lighting, and a live material
            configurator — built with an explicit performance budget
            (lazy-loaded bundle, fallback-first, reduced-motion aware)
            instead of an unbounded one.
          </p>
          <p className="max-w-2xl text-muted-foreground">
            Drop your own{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">.glb</code>{" "}
            file onto the canvas, or explore the default sample model.
          </p>
        </header>

        <ThreeDLabClient />

        <p className="text-sm text-muted-foreground">
          Prefer interfaces over 3D?{" "}
          <Link href="/playground" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to the Playground →
          </Link>
        </p>
      </div>
    </section>
  );
}