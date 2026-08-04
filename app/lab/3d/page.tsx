import type { Metadata } from "next";
import dynamic from "next/dynamic";

// ssr: false is required here — @react-three/fiber touches WebGL/canvas
// APIs that don't exist during server rendering. Lazy-loading also keeps
// three.js, @react-three/fiber, @react-three/drei, and leva (~600KB+
// combined, ungzipped) out of every other page's bundle; only /lab/3d
// pays for them, and only after this component actually mounts.
const ModelViewer = dynamic(
  () => import("@/features/three/components/model-viewer").then((mod) => mod.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        className="flex h-[28rem] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground sm:h-[32rem]"
      >
        Loading the 3D viewer…
      </div>
    ),
  }
);

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
            Drop your own <code className="rounded bg-muted px-1 py-0.5 text-xs">.glb</code>{" "}
            file onto the canvas, or explore the default sample model.
          </p>
        </header>

        <ModelViewer />

        <p className="text-xs text-muted-foreground">
          Interactive scene loads on demand and respects your device&apos;s reduced-motion
          setting. See{" "}
          <code className="rounded bg-muted px-1 py-0.5">THREE_D_EXPERIENCE_README.md</code>{" "}
          for the performance notes behind these choices.
        </p>
      </div>
    </section>
  );
}