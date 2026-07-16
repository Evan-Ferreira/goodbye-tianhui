"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { updatePhoto, deletePhoto } from "../actions";
import type { Photo } from "../lib/photos";
import ConfirmDialog from "./ConfirmDialog";
import Lightbox from "./Lightbox";

type GalleryPhoto = Photo & { url: string };

export default function PhotoCard({
  photo,
  rotation,
}: {
  photo: GalleryPhoto;
  rotation: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "save" | "delete">(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [description, setDescription] = useState(photo.description);
  const [author, setAuthor] = useState(photo.author);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    descriptionRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editOpen]);

  useEffect(() => {
    if (!editOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirm === null) setEditOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editOpen, confirm]);

  function openEdit() {
    setDescription(photo.description);
    setAuthor(photo.author);
    setError(null);
    setEditOpen(true);
  }

  function handleConfirm() {
    startTransition(async () => {
      if (confirm === "delete") {
        const res = await deletePhoto(photo.id, photo.storage_path);
        if (res.ok) {
          setConfirm(null);
        } else {
          setError(res.error ?? "Couldn't delete this photo. Please try again.");
        }
      } else if (confirm === "save") {
        const res = await updatePhoto({
          id: photo.id,
          author: author.trim(),
          description: description.trim(),
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
        className={`break-inside-avoid group relative bg-surface-container-highest p-4 shadow-lg hover:shadow-2xl transition-all ${rotation} hover:rotate-0`}
      >
        <div className="absolute top-6 right-6 z-10 flex gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <button
            type="button"
            aria-label="Edit photo"
            onClick={openEdit}
            className={`${toolbarButton} text-on-surface-variant hover:text-primary`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            aria-label="Delete photo"
            onClick={() => {
              setError(null);
              setConfirm("delete");
            }}
            className={`${toolbarButton} text-on-surface-variant hover:text-error`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={
            photo.description ? `View photo: ${photo.description}` : "View photo"
          }
          className="relative aspect-square w-full mb-4 overflow-hidden bg-surface-dim block cursor-zoom-in"
        >
          <Image
            src={photo.url}
            alt={photo.description || `Photo shared by ${photo.author}`}
            fill
            sizes="(min-width: 1280px) 260px, (min-width: 768px) 45vw, 90vw"
            className="object-cover sepia-[0.1] brightness-105 group-hover:scale-105 transition-transform duration-500"
          />
        </button>
        {photo.description ? (
          <div className="font-handwritten-note text-on-surface-variant text-center text-[16px] px-2 pb-1 break-words">
            {photo.description}
          </div>
        ) : null}
        <div className="font-label-sm text-on-surface-variant/60 text-center pb-2">
          — {photo.author}
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
          aria-labelledby={`edit-photo-title-${photo.id}`}
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
              setError(null);
              setConfirm("save");
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">edit_square</span>
              <h2 id={`edit-photo-title-${photo.id}`} className="font-headline-md text-on-surface">
                Edit memory
              </h2>
            </div>

            {/* Preview of the (non-editable) photo */}
            <div className="relative aspect-video w-full overflow-hidden rounded-[0.25rem] bg-surface-dim">
              <Image
                src={photo.url}
                alt={photo.description || `Photo shared by ${photo.author}`}
                fill
                sizes="(min-width: 512px) 480px, 90vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`edit-photo-description-${photo.id}`}
                className="font-label-sm text-on-surface-variant uppercase"
              >
                Description
              </label>
              <textarea
                id={`edit-photo-description-${photo.id}`}
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full min-h-[80px] p-4 bg-surface-container rounded-[0.25rem] font-body-md text-on-surface border-none focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                placeholder="What's the story behind this photo?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`edit-photo-author-${photo.id}`}
                className="font-label-sm text-on-surface-variant uppercase"
              >
                Your Name
              </label>
              <input
                id={`edit-photo-author-${photo.id}`}
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
        title={confirm === "delete" ? "Delete this photo?" : "Save changes?"}
        description={
          confirm === "delete"
            ? error ?? "This photo will be removed for everyone. This can't be undone."
            : "Your changes will be saved to the gallery."
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

      <Lightbox
        open={lightboxOpen}
        src={photo.url}
        alt={photo.description || `Photo shared by ${photo.author}`}
        caption={photo.description}
        author={photo.author}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
