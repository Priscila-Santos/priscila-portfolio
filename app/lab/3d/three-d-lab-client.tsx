"use client";

import dynamic from "next/dynamic";

// This file exists only to hold the ssr:false dynamic import. `ssr: false`
// is not supported inside a Server Component (app/lab/3d/page.tsx exports
// `metadata`, so it must stay a Server Component). Without this client
// boundary, Next.js can't guarantee the dynamically-imported module only
// runs in the browser — in practice that let three.js's GLTFLoader
// execute inside the Vercel Node.js runtime during rendering, which
// crashed with "ReferenceError: ProgressEvent is not defined" because
// that browser API doesn't exist in Node.
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

export function ThreeDLabClient() {
  return <ModelViewer />;
}