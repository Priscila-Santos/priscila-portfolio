"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  // Ref to the dialog panel itself (not the overlay)
  const dialogRef = useRef<HTMLDivElement>(null);

  // Ref to the element that should receive focus when opening
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Store the element that had focus before opening
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Save the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus inside the dialog
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function trapFocus(event: KeyboardEvent) {
    if (!dialogRef.current) return;

    const focusableElements =
      dialogRef.current.querySelectorAll<HTMLElement>(
        `
        button,
        a[href],
        input,
        select,
        textarea,
        [tabindex]:not([tabindex="-1"])
        `
      );

    // Nothing to trap
    if (focusableElements.length === 0) {
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    // Shift + Tab on first element
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    // Tab on last element
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleClose() {
    onClose();

    // Return focus to the button that opened the modal
    previousFocusRef.current?.focus();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(event) => {
        // Only close if the backdrop itself was clicked
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="dialog-title"
            className="text-lg font-semibold"
          >
            {title}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p
          id="dialog-description"
          className="mb-4 text-gray-600"
        >
          {description}
        </p>

        <div>{children}</div>
      </div>
    </div>
  );
}