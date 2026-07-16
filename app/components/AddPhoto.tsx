"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addPhoto } from "../actions";
import { createClient } from "../lib/supabase";
import { PHOTO_BUCKET } from "../lib/photos";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fileExtension(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  if (fromName) return fromName.toLowerCase();
  const fromType = file.type.split("/").pop();
  return (fromType || "bin").toLowerCase();
}

export default function AddPhoto() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);

  // Lock body scroll + Escape-to-close while open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function reset() {
    formRef.current?.reset();
    setFile(null);
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    if (!file) {
      setError("Please choose a photo to share.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is too large (max 10 MB).");
      return;
    }

    const author = String(formData.get("author") ?? "");
    const description = String(formData.get("description") ?? "");

    startTransition(async () => {
      try {
        const supabase = createClient();
        const path = `${crypto.randomUUID()}.${fileExtension(file)}`;

        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          setError("Couldn't upload your photo. Please try again.");
          return;
        }

        const meta = new FormData();
        meta.set("author", author);
        meta.set("description", description);
        meta.set("storage_path", path);

        const result = await addPhoto({ ok: false }, meta);
        if (result.ok) {
          setOpen(false);
          reset();
        } else {
          setError(result.error ?? "Couldn't add your photo. Please try again.");
        }
      } catch {
        setError("Couldn't add your photo. Please try again.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative px-8 py-4 bg-primary text-on-primary font-headline-md text-[18px] rounded-[0.5rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95 rotate-1 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined">add_a_photo</span>
          Add a Photo
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
          aria-labelledby="add-photo-title"
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
                photo_camera
              </span>
              <h2 id="add-photo-title" className="font-headline-md text-on-surface">
                Share a Memory
              </h2>
            </div>

            {/* File picker */}
            <label
              htmlFor="photo-file"
              className="flex flex-col items-center justify-center gap-2 min-h-[160px] p-6 bg-surface-container rounded-[0.25rem] border-2 border-dashed border-outline-variant/60 hover:border-primary/50 cursor-pointer transition-colors text-center"
            >
              <span className="material-symbols-outlined text-primary text-[40px]">
                {file ? "check_circle" : "cloud_upload"}
              </span>
              <span className="font-body-md text-on-surface-variant break-all">
                {file ? file.name : "Tap to choose a photo"}
              </span>
              <input
                id="photo-file"
                name="photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="photo-description"
                className="font-label-sm text-on-surface-variant uppercase"
              >
                Description
              </label>
              <textarea
                id="photo-description"
                name="description"
                maxLength={500}
                className="w-full min-h-[80px] p-4 bg-surface-container rounded-[0.25rem] font-body-md text-on-surface border-none focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                placeholder="What's the story behind this photo?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="photo-author"
                className="font-label-sm text-on-surface-variant uppercase"
              >
                Your Name
              </label>
              <input
                id="photo-author"
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
              {isPending ? "Uploading…" : "Add to Gallery"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
