---
title: "3D Model Viewer"
topic: "3D Model Viewer"
stack: "React Three Fiber · @react-three/drei · leva · Next.js"
---

## Problem

FE-AA2 asked for a shipped, interactive 3D experience in the browser — not a demo screenshot — that loads responsibly and works on a phone, not just a desktop with a GPU to spare.

## What she did

Built a drag-and-drop GLB viewer: drop any .glb file onto the canvas and it auto-centers, auto-scales, and stages itself with environment lighting and soft contact shadows via drei's Stage component.

Added a live configurator (leva) for base color, metalness, roughness, a wireframe toggle, environment preset, and auto-rotate speed, applied by traversing the loaded scene graph's materials.

Kept the 3D vendor bundle (three.js + fiber + drei + leva) out of every other page by lazy-loading the canvas with next/dynamic (ssr: false), and gated it behind a static, zero-motion fallback that respects prefers-reduced-motion and a best-effort low-power/data-saver check.

## Outcome

A working, mobile-usable 3D scene (touch orbit/zoom via drei's OrbitControls) with an explicit performance budget instead of an unbounded one — documented with real bundle-size and frame-rate notes in the project README.
