"use client";

import { useCallback, useState } from "react";

import { SendButton, DeployButton } from "@/components/ui/lifecycle-button-presets";

/** Fake async call: random delay, 20% failure rate, as specified in the brief. */
function fakeRequest(): Promise<void> {
  const delay = 700 + Math.random() * 900;
  const willFail = Math.random() < 0.2;

  return new Promise((resolve, reject) => {
    setTimeout(() => (willFail ? reject(new Error("simulated failure")) : resolve()), delay);
  });
}

/** Deterministic triggers so the states can be demoed on demand, not just left to chance. */
function forcedRequest(shouldFail: boolean): Promise<void> {
  const delay = 700 + Math.random() * 500;
  return new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error("forced failure")) : resolve()), delay);
  });
}

export default function MotionButtonPage() {
  const [disabled, setDisabled] = useState(false);
  const handleRandom = useCallback(() => fakeRequest(), []);
  const handleSuccess = useCallback(() => forcedRequest(false), []);
  const handleError = useCallback(() => forcedRequest(true), []);

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-page-x py-section">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">FE-AA1 · Build+</p>
        <h1 className="text-display text-primary">Buttons with a Brain</h1>
        <p className="max-w-xl text-muted-foreground">
          One component, two labels. Click the buttons below to run a real
          (fake) async call — 20% of attempts fail on purpose — or use the
          forced triggers to see success and error on demand.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Random outcome (20% failure)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <SendButton onAction={handleRandom} disabled={disabled} />
          <DeployButton onAction={handleRandom} disabled={disabled} />
        </div>
        <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(event) => setDisabled(event.target.checked)}
            className="size-4"
          />
          Disabled state
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Forced triggers</h2>
        <div className="flex flex-wrap items-center gap-4">
          <SendButton onAction={handleSuccess} />
          <SendButton onAction={handleError} />
        </div>
        <p className="text-sm text-muted-foreground">
          Left button always succeeds. Right button always fails, so the
          shake/error path doesn&apos;t depend on luck to demo.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-6 text-sm leading-6">
        <h2 className="text-lg font-semibold text-primary">Duration &amp; easing notes</h2>
        <ul className="list-disc space-y-2 pl-5 text-card-foreground">
          <li>
            <strong>Hover/press (150ms / 100ms):</strong> fast enough to read
            as an instant response to the cursor, not a separate animation.
            Hover eases out (decelerates into the lift); press eases in
            (snaps down quickly) so the two feel like opposite gestures, not
            the same tween played backwards.
          </li>
          <li>
            <strong>Content cross-fade (200ms, standard ease
            <code className="ml-1 rounded bg-muted px-1 font-mono text-xs">cubic-bezier(0.4,0,0.2,1)</code>):</strong>{" "}
            idle/loading swap only opacity and a small translate, on two
            absolutely-stacked layers, so the button&apos;s box never
            resizes — no layout thrash, just compositor work.
          </li>
          <li>
            <strong>Spinner (700ms linear, infinite):</strong> linear on
            purpose — an eased rotation reads as broken, since a spinner has
            no start or end to accelerate toward.
          </li>
          <li>
            <strong>Success check (320ms,
            <code className="ml-1 rounded bg-muted px-1 font-mono text-xs">cubic-bezier(0.34,1.56,0.64,1)</code>):</strong>{" "}
            a slight overshoot (&quot;back-out&quot;) so the checkmark feels
            rewarding rather than just correct.
          </li>
          <li>
            <strong>Error shake (420ms ease-in-out):</strong> short and
            sharp — long enough to register as deliberate feedback, short
            enough that it doesn&apos;t block the visible &quot;Retry&quot;
            label from being read immediately.
          </li>
          <li>
            <strong>Auto-return to idle (1.4s hold):</strong> long enough to
            read &quot;Sent&quot; or &quot;Retry&quot; before the button
            resets, short enough not to feel stuck.
          </li>
          <li>
            <strong>Reduced motion:</strong> the shake, spin, and pop
            animations are all wrapped in <code className="rounded bg-muted px-1 font-mono text-xs">motion-safe:</code>,
            and every transition also carries a <code className="rounded bg-muted px-1 font-mono text-xs">motion-reduce:transition-none</code>{" "}
            fallback. Feedback never disappears — the color and label still
            change instantly — only the glide/shake/spin does.
          </li>
        </ul>
      </section>
    </main>
  );
}