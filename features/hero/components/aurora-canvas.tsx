"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { vertexShader, fragmentShader } from "@/features/hero/shaders/aurora";
import { useTabVisible } from "@/features/hero/lib/use-tab-visible";

/**
 * The actual shader plane. Scaled to `viewport.width`/`viewport.height`
 * (R3F's frustum size at z=0 for the default camera) so it covers the
 * canvas exactly — the standard "fullscreen shader plane" pattern, same
 * idea as `<Stage>` auto-fitting a model in the 3D Lab, just manual here
 * since there's no model to fit, only the viewport itself.
 */
function AuroraPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseCurrent = useRef(new THREE.Vector2(0.5, 0.5));
  const { viewport, size, gl } = useThree();

  // useMemo (not useState) because these uniform objects are mutated in
  // place every frame below — recreating them on render would break the
  // reference React Three Fiber holds onto internally.
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    uniforms.u_time.value = state.clock.getElapsedTime();

    // Lerp toward the target instead of snapping straight to the pointer
    // position — this is what makes the mouse influence read as a gentle
    // lean rather than the flow field jumping around every mousemove.
    mouseCurrent.current.lerp(mouseTarget.current, 0.04);
    uniforms.u_mouse.value.copy(mouseCurrent.current);

    // Resolution in device pixels (size is in CSS pixels; multiply by the
    // renderer's actual, DPR-capped pixel ratio) so the aspect-correction
    // math in the fragment shader stays accurate after the DPR cap below.
    const pixelRatio = gl.getPixelRatio();
    uniforms.u_resolution.value.set(size.width * pixelRatio, size.height * pixelRatio);
  });

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (event.uv) {
      mouseTarget.current.set(event.uv.x, event.uv.y);
    }
  }

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * Public entry point, dynamically imported (ssr: false) by ShaderHero so
 * this file — and the three.js/fiber bundle it pulls in — never loads for
 * a reduced-motion or no-WebGL visitor, following the same pattern as
 * ThreeDLabClient/ModelViewer in the 3D Lab.
 */
export function AuroraCanvas() {
  const tabVisible = useTabVisible();

  return (
    <Canvas
      // devicePixelRatio capped at 1.5 (not the device's real value, which
      // can be 3+ on phones) — same cap used in the 3D Lab, for the same
      // reason: a fullscreen shader running at native retina resolution on
      // a phone is a real battery/thermal cost for a hero background.
      dpr={[1, 1.5]}
      // "never" stops R3F's internal render loop entirely while the tab
      // is hidden, rather than merely skipping visual updates — this is
      // the actual pause, not just a cosmetic freeze.
      frameloop={tabVisible ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "low-power" }}
      className="h-full w-full"
    >
      <AuroraPlane />
    </Canvas>
  );
}