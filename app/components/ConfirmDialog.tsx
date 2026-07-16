"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
  tone?: "default" | "danger";
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  pending = false,
  tone = "default",
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pending, onCancel]);

  const confirmClasses =
    tone === "danger"
      ? "bg-error text-on-error"
      : "bg-primary text-on-primary";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-on-surface/50 transition-opacity duration-200 backdrop-blur-sm ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={`relative w-full max-w-sm bg-surface-container-lowest rounded-[0.5rem] shadow-2xl p-6 transform transition-transform duration-200 ${
          open ? "scale-100" : "scale-90"
        }`}
      >
        <h2 id="confirm-title" className="font-headline-md text-on-surface mb-2">
          {title}
        </h2>
        {description ? (
          <p className="font-body-md text-on-surface-variant mb-6">{description}</p>
        ) : (
          <div className="mb-6" />
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-5 py-2.5 font-headline-md text-[16px] text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`px-5 py-2.5 font-headline-md text-[16px] rounded-[0.25rem] shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${confirmClasses}`}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
