/**
 * Aurora hero shader.
 *
 * Remixed from the session's shader playground: kept the domain-warped
 * fbm flow field (that's the actual "aurora" look — a single noise call
 * reads as a blob, not a drifting curtain), and rebuilt the rest —
 * palette, mouse influence, vignette, and grain — from scratch to match
 * this portfolio's Identity Kit (rose/blue accents, dark navy base) and
 * to satisfy FE-AA3's two-uniform-minimum and readability requirements.
 */

// Pass-through vertex shader: the plane's geometry already covers the
// full viewport (scaled in AuroraPlane via R3F's `viewport`), so all this
// does is hand the fragment shader a 0..1 UV per pixel.
export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  varying vec2 vUv;

  // --- 2D simplex noise (Ashima Arts / Ian McEwan reference implementation,
  // MIT licensed, the standard building block used across shader tutorials
  // for this kind of noise). I did not write this function from scratch —
  // I can explain what it does (returns a smooth pseudo-random value in
  // roughly [-1, 1] for any 2D input) but the permutation-polynomial trick
  // inside it is standard, not something I derived myself.
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // fbm ("fractal brownian motion"): stack several octaves of the noise
  // above, each smaller and quieter than the last. A single snoise() call
  // looks like a blob; stacking 5 octaves is what actually reads as an
  // organic, cloud/aurora-like texture instead of a flat wave.
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Center the UV on (0,0) and correct for aspect ratio, so the noise
    // field isn't stretched on wide screens.
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // Mouse influence: u_mouse arrives as normalized 0..1 (from R3F's
    // pointer event UV), converted to the same centered/aspect-corrected
    // space as p. "pull" nudges the sampling point toward the cursor,
    // falling off with distance (smoothstep), so it reads as the aurora
    // gently leaning toward you rather than snapping to your pointer.
    vec2 mouse = (u_mouse - 0.5) * vec2(aspect, 1.0);
    float mouseDist = length(p - mouse);
    vec2 pull = normalize(mouse - p + 0.0001) * smoothstep(0.9, 0.0, mouseDist) * 0.15;

    // Domain warp: feed one fbm's output back into the input of a second
    // fbm call, offset by slow time drift. This is the actual "aurora"
    // trick — without the warp, fbm alone looks like static fog; warping
    // it against itself over time is what makes it look like it's flowing.
    vec2 warp = p + pull;
    float n1 = fbm(warp * 1.6 + vec2(0.0, u_time * 0.05));
    float n2 = fbm(warp * 1.6 + n1 * 0.6 + vec2(u_time * 0.03, 0.0));

    // Palette: dark navy base -> rose -> blue, taken directly from
    // IDENTITY_KIT.md's dark-mode tokens (--bg-primary, --color-pop-pink,
    // --color-blue-accent), so the hero doesn't introduce a third,
    // unrelated color system.
    vec3 bg   = vec3(0.043, 0.059, 0.098);
    vec3 rose = vec3(0.957, 0.247, 0.369);
    vec3 blue = vec3(0.220, 0.741, 0.973);

    float band = smoothstep(-0.2, 0.6, n2);
    vec3 color = mix(bg, rose, band * 0.8);
    color = mix(color, blue, smoothstep(0.3, 0.9, n1) * 0.6);

    // Vignette: keep the center brighter than the edges. This alone isn't
    // the readability fix (see the CSS scrim in ShaderHero) but it stops
    // the corners from competing with the headline for attention.
    float dist = length(p);
    float vignette = 1.0 - smoothstep(0.3, 1.2, dist);
    color *= mix(0.55, 1.0, vignette);

    // Grain: a cheap per-pixel pseudo-random dither (hashing the screen
    // coordinate) added/subtracted from the final color. Breaks up the
    // smooth gradient bands so they don't look like flat, banded plastic.
    float grain = fract(sin(dot(uv * u_resolution.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.035;

    gl_FragColor = vec4(color, 1.0);
  }
`;