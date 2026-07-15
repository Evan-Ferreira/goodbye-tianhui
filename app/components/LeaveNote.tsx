"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addNote } from "../actions";
import { NOTE_COLORS, NOTE_THEMES, type NoteColor } from "../lib/notes";

const COLOR_LABELS: Record<NoteColor, string> = {
  yellow: "Yellow note",
  blue: "Blue note",
  coral: "Coral note",
  gold: "Gold note",
};

export default function LeaveNote() {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addNote({ ok: false }, formData);
      if (result.ok) {
        setOpen(false);
        setSelectedColor("yellow");
        formRef.current?.reset();
      } else {
        setError(result.error ?? "Couldn't pin your note. Please try again.");
      }
    });
  }

  // Lock body scroll, focus the textarea, and wire up Escape-to-close while open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    textareaRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative px-8 py-4 bg-primary text-on-primary font-headline-md text-[18px] rounded-[0.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 rotate-1 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined">edit_note</span>
          Leave a Note
        </span>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Modal Overlay */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 transition-opacity duration-300 backdrop-blur-sm ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-note-title"
          className={`relative w-full max-w-lg bg-surface-container-lowest rounded-[0.5rem] shadow-2xl p-8 transform transition-transform duration-300 ${
            open ? "scale-100" : "scale-90"
          }`}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">
                edit_square
              </span>
              <h2 id="leave-note-title" className="font-headline-md text-on-surface">
                Write to Tianhui
              </h2>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                name="message"
                required
                maxLength={1000}
                className="w-full min-h-[180px] p-6 bg-surface-container rounded-[0.25rem] font-handwritten-note text-handwritten-note text-on-surface border-none focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none leading-loose shadow-inner"
                placeholder="Your heartfelt message here..."
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 31px, #dec0bb 31px, #dec0bb 32px)",
                  backgroundAttachment: "local",
                }}
              />
            </div>

            {/* Color picker */}
            <input type="hidden" name="color" value={selectedColor} />
            <div className="grid grid-cols-4 gap-4">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={COLOR_LABELS[color]}
                  aria-pressed={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 rounded-[0.25rem] ${NOTE_THEMES[color].swatch} border-2 transition-all ${
                    selectedColor === color
                      ? "border-primary ring-offset-2"
                      : "border-transparent hover:scale-105"
                  }`}
                ></button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="note-author" className="font-label-sm text-on-surface-variant uppercase">
                Your Name
              </label>
              <input
                id="note-author"
                name="author"
                maxLength={80}
                className="bg-surface-container-high p-4 rounded-[0.25rem] font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Alex"
                type="text"
              />
            </div>

            {error ? (
              <p className="font-label-sm text-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-primary text-on-primary font-headline-md rounded-[0.25rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isPending ? "Pinning…" : "Pin to Board"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
