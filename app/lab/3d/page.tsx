import type { Metadata } from "next";

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
        <header className="space-y-2">
          <p className="text-sm font-medium text-accent">FE-AA2 · Build+</p>
          <h1 className="text-display text-primary">3D model viewer</h1>
          <p className="max-w-2xl text-muted-foreground">
            A staged WebGL scene with orbit controls, environment lighting, and a
            live configurator for color, metalness, roughness, and wireframe.
            Drop your own <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">.glb</code>{" "}
            file onto the canvas, or explore the default sample model.
          </p>
        </header>

        <ThreeDLabClient />
      </div>
    </section>
  );
}