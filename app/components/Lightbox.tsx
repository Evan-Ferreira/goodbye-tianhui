"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type LightboxProps = {
  open: boolean;
  src: string;
  alt: string;
  caption?: string;
  author?: string;
  onClose: () => void;
};

export default function Lightbox({
  open,
  src,
  alt,
  caption,
  author,
  onClose,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 p-4 bg-on-surface/80 transition-opacity duration-300 backdrop-blur-sm ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-[0.75rem] bg-surface-container-lowest/90 shadow-lg flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[28px]">close</span>
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        className={`relative w-[92vw] h-[85vh] transform transition-transform duration-300 ${
          open ? "scale-100" : "scale-95"
        }`}
        // Stop backdrop-close when clicking the image area itself.
        onClick={(e) => e.stopPropagation()}
      >
        {open ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="92vw"
            className="object-contain"
            priority
          />
        ) : null}
      </div>

      {(caption || author) && open ? (
        <div
          className="max-w-[92vw] text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {caption ? (
            <p className="font-handwritten-note text-handwritten-note text-inverse-on-surface break-words">
              {caption}
            </p>
          ) : null}
          {author ? (
            <p className="font-label-sm text-inverse-on-surface/70 mt-1">— {author}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
