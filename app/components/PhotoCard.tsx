"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "../lib/photos";
import Lightbox from "./Lightbox";

type GalleryPhoto = Photo & { url: string };

export default function PhotoCard({
  photo,
  rotation,
}: {
  photo: GalleryPhoto;
  rotation: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className={`break-inside-avoid group relative bg-surface-container-highest p-4 shadow-lg hover:shadow-2xl transition-all ${rotation} hover:rotate-0`}
      >
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
