# NOTES.md

Comparing my hand-built components (`app/playground/components/ui/`) against
shadcn/ui's generated equivalents (`components/ui/`), installed via the
"Base UI / Nova" preset.

## Modal vs shadcn Dialog

Same architectural pattern as Tabs, confirmed a second time: `dialog.tsx`
contains no focus trap, no Escape handler, and no return-focus logic
anywhere in the file. My `Modal.tsx` implements all three visibly — the
`useEffect` with a keydown listener, the `trapFocus` function walking
focusable elements, and `handleClose` restoring focus via
`previousFocusRef`. shadcn delegates all of that to `@base-ui/react/dialog`'s
internal `Root`/`Popup` implementation. Two components in, this is now a
confirmed pattern rather than a one-off: shadcn's generated files are
styling wrappers, not full implementations — the interaction logic always
lives in the imported headless library.

- **Gap 1 — No portal rendering:** shadcn wraps its content in
  `DialogPortal`, mounting the dialog outside the normal DOM tree (typically
  near `document.body`). My modal renders inline, using `position: fixed`
  with `z-50`. This usually works, but isn't airtight — if any ancestor has
  `overflow: hidden` or a CSS `transform`, `fixed` positioning resolves
  against that ancestor instead of the viewport, and my modal could get
  clipped or trapped visually even with a high z-index. Portals avoid this
  by escaping the ancestor tree entirely. Testable: nest `Modal` inside a
  parent with `overflow: hidden` and see if it clips.
- **Gap 2 — Initial focus target isn't verifiable from source alone:** I
  explicitly focus the close button on open (`closeButtonRef.current?.focus()`).
  shadcn's `Popup` has `outline-none` but no visible ref or focus call in
  `dialog.tsx` — Base UI decides internally what receives focus, and it's
  not clear from the file whether that's the popup container or a specific
  child element. Both are valid APG patterns, but they're different
  patterns, and confirming which one shadcn uses requires testing in the
  browser rather than reading the generated file.

## Tabs vs shadcn Tabs

**Architectural difference (the biggest one):** my `Tabs.tsx` contains a full
`handleKeyDown` function — every keyboard interaction (ArrowRight, ArrowLeft,
Home, End) is visible and readable top to bottom in my own file. shadcn's
`TabsTrigger` has no keyboard handler at all in the file it generates —
`role`, `aria-selected`, `tabIndex`, and all keyboard logic live inside the
`@base-ui/react/tabs` package in `node_modules`, not in the code shadcn writes
into my project. This was the most important realization of the comparison:
shadcn's CLI doesn't hand you a full reimplementation you can audit by
reading — it hands you a *styling wrapper* around a headless interaction
library. To actually verify keyboard behavior, I had to test it in the
browser rather than just read the source.

- **Gap 1 — Orientation support:** shadcn's Tabs supports both horizontal and
  vertical layouts (`group-data-vertical/tabs:*` classes), which under the
  W3C APG pattern means different arrow keys apply depending on orientation
  (Up/Down vs Left/Right). My `handleKeyDown` only implements the horizontal
  case — I built for the layout I needed, but there's no orientation
  awareness in my version at all.
- **Gap 2 — Disabled tab state:** shadcn's trigger has built-in styling and
  ARIA handling for both native `disabled` and `aria-disabled` states. My
  `Tab` interface has no `disabled` field — there's no way to mark a tab
  unavailable, visually or to assistive tech, in my implementation.

**Where my version has an edge:** my explicit `aria-controls`/
`aria-labelledby` pairing between each tab and its panel is something I can
verify correct just by reading my own code. I can't say the same about Base
UI's internals with the same confidence without opening the library source —
reading your own implementation gives a kind of certainty that reading a
wrapper around someone else's headless library doesn't.

## Tooling gaps encountered during setup

Not component-level, but genuine friction points from getting shadcn running
at all, worth recording since they're real evidence of engineering judgment:

- shadcn's CLI (Base UI / Nova preset) generated `globals.css` using
  Tailwind v4 conventions (`@theme`-style automatic utility generation) in a
  project running Tailwind v3.4.17. This silently broke the build — no
  warning, just missing utility classes (`bg-background`, `outline-ring/50`)
  — and required manually mapping every shadcn color token into
  `tailwind.config.ts` by hand.
- The CLI also failed framework detection twice before working: once because
  `next.config.js` didn't exist (Next.js runs fine without it, but shadcn's
  detector requires it), and once because `tsconfig.json` had no path alias
  configured for `@/*` imports.
- Installing the `geist` package directly (rather than via
  `next/font/google`) required using it as a pre-configured object
  (`GeistSans.variable`), not calling it as a function with options — an easy
  mistake when switching between two differently-shaped font APIs.

## Where I chose not to use AI

Per the assignment brief, I built Modal, Tabs, and Disclosure by hand before
touching shadcn or any AI tool for the components themselves. I used Codex
only for scaffolding (routes, TypeScript config) and, after building, as a
reviewer to check my finished components against the ARIA Authoring
Practices pattern — not to author them. That distinction mattered: the whole
point of this assignment is being able to review AI-generated components
critically, which only works if the "by hand" baseline is actually mine.