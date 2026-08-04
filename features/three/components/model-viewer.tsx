"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Leva, useControls } from "leva";
import * as THREE from "three";

import { SceneFallback } from "@/features/three/components/scene-fallback";
import { usePrefersReducedMotion } from "@/features/three/lib/use-prefers-reduced-motion";
import { useLowPowerContext } from "@/features/three/lib/use-low-power-context";

// Small (~120KB), uncompressed Khronos sample model, used only as a
// non-empty default so the page always has something to look at. Swap
// this for a self-hosted, DRACO/meshopt-compressed .glb for production —
// see the perf note in THREE_D_EXPERIENCE_README.md.
const DEFAULT_MODEL_URL =
  "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@main/2.0/Duck/glTF-Binary/Duck.glb";

const ENVIRONMENT_PRESETS = ["city", "sunset", "warehouse", "forest", "studio"] as const;
type EnvironmentPreset = (typeof ENVIRONMENT_PRESETS)[number];

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

type ConfiguratorValues = {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  environment: EnvironmentPreset;
  autoRotateSpeed: number;
};

/** Loads a GLB by URL and applies the live configurator values to every
 * standard material found in the scene graph. Suspends while loading, so
 * it must render inside a `<Suspense>` boundary — that boundary is also
 * where drag-and-drop swaps show their own loading state. */
function Model({ url, config }: { url: string; config: ConfiguratorValues }) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial
          ) {
            material.color.set(config.color);
            material.metalness = config.metalness;
            material.roughness = config.roughness;
            material.wireframe = config.wireframe;
            material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, config]);

  return (
    <Stage environment={null} intensity={0.6} shadows="contact" adjustCamera>
      <primitive object={clonedScene} />
    </Stage>
  );
}

function DropZone({
  onFile,
  children,
}: {
  onFile: (file: File) => void;
  children: ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && file.name.toLowerCase().endsWith(".glb")) {
        onFile(file);
      }
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="relative h-full"
    >
      {children}
      {isDragging && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent/10 text-sm font-medium text-accent"
        >
          Drop a .glb file to load it
        </div>
      )}
    </div>
  );
}

/** Renders once the visitor has opted into (or the device qualifies for)
 * the interactive canvas. Kept separate from the gating logic so the
 * always-mounted parent stays cheap. */
function ActiveViewer() {
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [fileName, setFileName] = useState("Duck.glb (default sample)");

  const config = useControls("Material & scene", {
    color: "#f43f5e",
    metalness: { value: 0.15, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.55, min: 0, max: 1, step: 0.01 },
    wireframe: false,
    environment: { value: "city" as EnvironmentPreset, options: ENVIRONMENT_PRESETS },
    autoRotateSpeed: { value: 0.8, min: 0, max: 4, step: 0.1 },
  }) as ConfiguratorValues;

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setFileName(file.name);
  }, []);

  // Revoke any blob URL created for a dropped file when it's replaced or
  // the component unmounts, so dropped models don't leak memory.
  useEffect(() => {
    return () => {
      if (modelUrl.startsWith("blob:")) URL.revokeObjectURL(modelUrl);
    };
  }, [modelUrl]);

  return (
    <div className="relative h-[28rem] overflow-hidden rounded-xl border bg-card sm:h-[32rem]">
      <Leva collapsed titleBar={{ title: "Configurator" }} />
      <DropZone onFile={handleFile}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ fov: 40, position: [3, 2, 5] }}
          gl={{ antialias: true, powerPreference: "low-power" }}
        >
          <Suspense fallback={null}>
            <Model url={modelUrl} config={config} />
            <Environment preset={config.environment} />
          </Suspense>
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            autoRotate={config.autoRotateSpeed > 0}
            autoRotateSpeed={config.autoRotateSpeed}
            minDistance={1.5}
            maxDistance={12}
          />
        </Canvas>
      </DropZone>
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
        {fileName} · drag a .glb anywhere on the canvas to swap it
      </p>
    </div>
  );
}

useGLTF.preload(DEFAULT_MODEL_URL);

/**
 * Public entry point. Handles progressive enhancement: starts on a static,
 * motion-free fallback and only mounts the WebGL canvas — and therefore
 * only pulls in the three.js / fiber / drei / leva bundle — once the
 * visitor opts in, unless their device already looks capable and unbothered
 * by motion, in which case it enables automatically.
 */
export function ModelViewer() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerContext();
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [autoDecided, setAutoDecided] = useState(false);

  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  useEffect(() => {
    if (autoDecided || webglSupported === null) return;
    setEnabled(webglSupported && !prefersReducedMotion && !lowPower);
    setAutoDecided(true);
  }, [autoDecided, webglSupported, prefersReducedMotion, lowPower]);

  if (webglSupported === false) {
    return <SceneFallback reason="webgl-unsupported" />;
  }

  if (!enabled) {
    const reason = prefersReducedMotion ? "reduced-motion" : lowPower ? "low-power" : "not-started";
    return <SceneFallback reason={reason} onEnable={() => setEnabled(true)} />;
  }

  return <ActiveViewer />;
}