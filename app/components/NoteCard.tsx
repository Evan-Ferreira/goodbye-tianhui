"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateNote, deleteNote } from "../actions";
import { NOTE_COLORS, NOTE_THEMES, type Note, type NoteColor } from "../lib/notes";
import ConfirmDialog from "./ConfirmDialog";

const COLOR_LABELS: Record<NoteColor, string> = {
  yellow: "Yellow note",
  blue: "Blue note",
  coral: "Coral note",
  gold: "Gold note",
};

export default function NoteCard({ note }: { note: Note }) {
  const theme = NOTE_THEMES[note.color];

  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "save" | "delete">(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState(note.message);
  const [author, setAuthor] = useState(note.author);
  const [color, setColor] = useState<NoteColor>(note.color);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Body-scroll lock + focus while the edit modal is open.
  useEffect(() => {
    if (!editOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    textareaRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editOpen]);

  // Escape closes the edit modal (but not while the confirm dialog is on top).
  useEffect(() => {
    if (!editOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirm === null) setEditOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editOpen, confirm]);

  function openEdit() {
    setMessage(note.message);
    setAuthor(note.author);
    setColor(note.color);
    setError(null);
    setEditOpen(true);
  }

  function requestSave() {
    if (message.trim().length === 0) {
      setError("Please write a message before saving.");
      return;
    }
    setError(null);
    setConfirm("save");
  }

  function handleConfirm() {
    startTransition(async () => {
      if (confirm === "delete") {
        const res = await deleteNote(note.id);
        if (res.ok) {
          setConfirm(null);
        } else {
          setError(res.error ?? "Couldn't delete this note. Please try again.");
        }
      } else if (confirm === "save") {
        const res = await updateNote({
          id: note.id,
          message: message.trim(),
          author: author.trim(),
          color,
        });
        if (res.ok) {
          setConfirm(null);
          setEditOpen(false);
        } else {
          setError(res.error ?? "Couldn't save your changes. Please try again.");
          setConfirm(null);
        }
      }
    });
  }

  const toolbarButton =
    "w-7 h-7 rounded-[0.75rem] bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm flex items-center justify-center transition-colors";

  return (
    <>
      <div
        className={`break-inside-avoid group relative ${theme.card} p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:rotate-1 flex flex-col justify-between border-t-8 border-black/5`}
      >
        {/* Edit / delete toolbar */}
        <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <button
            type="button"
            aria-label="Edit note"
            onClick={openEdit}
            className={`${toolbarButton} text-on-surface-variant hover:text-primary`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            aria-label="Delete note"
            onClick={() => {
              setError(null);
              setConfirm("delete");
            }}
            className={`${toolbarButton} text-on-surface-variant hover:text-error`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        <span
          className={`material-symbols-outlined absolute top-2 right-2 ${theme.pin}`}
        >
          push_pin
        </span>
        <div
          className={`font-handwritten-note ${theme.text} text-handwritten-note mb-6 mt-6 whitespace-pre-wrap break-words`}
        >
          {note.message}
        </div>
        <div className={`flex items-center justify-between border-t ${theme.border} pt-4`}>
          <span className={`font-label-sm ${theme.author}`}>— {note.author}</span>
          <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
        </div>
      </div>

      {/* Edit modal */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && confirm === null) setEditOpen(false);
        }}
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 transition-opacity duration-300 backdrop-blur-sm ${
          editOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`edit-note-title-${note.id}`}
          className={`relative w-full max-w-lg bg-surface-container-lowest rounded-[0.5rem] shadow-2xl p-8 transform transition-transform duration-300 ${
            editOpen ? "scale-100" : "scale-90"
          }`}
        >
          <button
            type="button"
            onClick={() => setEditOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestSave();
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">edit_square</span>
              <h2 id={`edit-note-title-${note.id}`} className="font-headline-md text-on-surface">
                Edit note
              </h2>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              className="w-full min-h-[180px] p-6 bg-surface-container rounded-[0.25rem] font-handwritten-note text-handwritten-note text-on-surface border-none focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none leading-loose shadow-inner"
              placeholder="Your heartfelt message here..."
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 31px, #dec0bb 31px, #dec0bb 32px)",
                backgroundAttachment: "local",
              }}
            />

            <div className="grid grid-cols-4 gap-4">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={COLOR_LABELS[c]}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-[0.25rem] ${NOTE_THEMES[c].swatch} border-2 transition-all ${
                    color === c ? "border-primary ring-offset-2" : "border-transparent hover:scale-105"
                  }`}
                ></button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`edit-note-author-${note.id}`}
                className="font-label-sm text-on-surface-variant uppercase"
              >
                Your Name
              </label>
              <input
                id={`edit-note-author-${note.id}`}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={80}
                className="bg-surface-container-high p-4 rounded-[0.25rem] font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Alex"
                type="text"
              />
            </div>

            {error && editOpen ? (
              <p className="font-label-sm text-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full py-4 bg-primary text-on-primary font-headline-md rounded-[0.25rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "delete" ? "Delete this note?" : "Save changes?"}
        description={
          confirm === "delete"
            ? error ?? "This note will be removed for everyone. This can't be undone."
            : "Your changes will be saved to the board."
        }
        confirmLabel={confirm === "delete" ? "Delete" : "Save"}
        tone={confirm === "delete" ? "danger" : "default"}
        pending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (isPending) return;
          setConfirm(null);
          setError(null);
        }}
      />
    </>
  );
}
