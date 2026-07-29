"use client";

import { Send, Rocket } from "lucide-react";

import { AsyncActionButton } from "@/components/ui/async-action-button";

type PresetProps = {
  onAction: () => Promise<void>;
  disabled?: boolean;
};

/** The button this activity is meant to feed back into: the portfolio chat's
 * Send action (features/chat/components/chat-interface.tsx). Same shape,
 * same transitions — only the icon and copy change. */
export function SendButton({ onAction, disabled }: PresetProps) {
  return (
    <AsyncActionButton
      onAction={onAction}
      disabled={disabled}
      icon={<Send aria-hidden="true" className="size-4" />}
      idleLabel="Send message"
      loadingLabel="Sending…"
      successLabel="Sent"
      errorLabel="Retry send"
    />
  );
}

/** A second, unrelated action reusing the exact same component — the "flex"
 * deliverable. Nothing about the motion changes between the two; only the
 * vocabulary (icon/labels) is different, which is the point. */
export function DeployButton({ onAction, disabled }: PresetProps) {
  return (
    <AsyncActionButton
      onAction={onAction}
      disabled={disabled}
      icon={<Rocket aria-hidden="true" className="size-4" />}
      idleLabel="Deploy"
      loadingLabel="Deploying…"
      successLabel="Deployed"
      errorLabel="Retry deploy"
    />
  );
}