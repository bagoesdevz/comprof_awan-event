"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type TouchEvent, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export type GalleryLightboxImage = {
  imageUrl: string;
  imageAlt: string;
  caption?: string;
};

type GalleryLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  images: GalleryLightboxImage[];
};

export function GalleryLightbox({ open, onOpenChange, title, description, images }: GalleryLightboxProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const imageCount = images.length;

  useEffect(() => {
    if (open) setActiveImageIndex(0);
  }, [open, title]);

  useEffect(() => {
    if (!open || imageCount < 2) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImageIndex((index) => (index - 1 + imageCount) % imageCount);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImageIndex((index) => (index + 1) % imageCount);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageCount, open]);

  if (imageCount === 0) return null;

  const activeImage = images[activeImageIndex];

  function showPreviousImage() {
    setActiveImageIndex((index) => (index - 1 + imageCount) % imageCount);
  }

  function showNextImage() {
    setActiveImageIndex((index) => (index + 1) % imageCount);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || imageCount < 2) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 48) return;
    if (distance > 0) showPreviousImage();
    else showNextImage();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-primary-950/[.38] backdrop-blur-sm"
        closeClassName="border-primary-100 bg-white/[.92] text-primary-600 shadow-[0_10px_28px_-14px_rgba(91,60,196,.42)] hover:bg-primary-100 focus-visible:ring-primary-600 focus-visible:ring-offset-white"
        className="h-auto max-h-[calc(100dvh-24px)] max-w-6xl gap-0 overflow-hidden border-primary-100 bg-white p-0 text-content-title shadow-[0_32px_100px_-38px_rgba(33,16,82,.38)] sm:h-[min(860px,calc(100dvh-24px))] sm:rounded-[28px_28px_28px_8px]"
      >
        <DialogTitle className="sr-only">Galeri {title}</DialogTitle>
        <DialogDescription className="sr-only">{description}. Foto {activeImageIndex + 1} dari {imageCount}.</DialogDescription>

        <div className="grid h-auto min-h-0 grid-rows-[auto_auto] sm:h-full sm:grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative aspect-[4/3] min-h-0 touch-pan-y overflow-hidden bg-[#f3effb] sm:aspect-auto" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <Image
              key={activeImage.imageUrl}
              src={activeImage.imageUrl}
              alt={activeImage.imageAlt}
              fill
              sizes="(min-width: 1280px) 1152px, calc(100vw - 24px)"
              className="object-contain"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary-950/10 to-transparent" aria-hidden="true" />

            {imageCount > 1 && (
              <>
                <button type="button" onClick={showPreviousImage} className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-primary-100 bg-white/[.92] text-primary-600 shadow-[0_10px_28px_-14px_rgba(91,60,196,.42)] backdrop-blur transition hover:bg-primary-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 sm:left-5" aria-label="Foto sebelumnya">
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" onClick={showNextImage} className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-primary-100 bg-white/[.92] text-primary-600 shadow-[0_10px_28px_-14px_rgba(91,60,196,.42)] backdrop-blur transition hover:bg-primary-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 sm:right-5" aria-label="Foto berikutnya">
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}

            <span className="absolute bottom-4 right-4 z-10 rounded-full border border-primary-100 bg-white/[.92] px-3 py-2 font-mono text-[9px] tracking-[0.1em] text-primary-600 shadow-diffusion backdrop-blur" aria-live="polite" aria-atomic="true">{String(activeImageIndex + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}</span>
          </div>

          <div className="border-t border-primary-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="min-w-0 pr-12 sm:pr-16">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary-600">Dokumentasi kegiatan</span>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-content-body">{activeImage.caption ?? description}</p>
              </div>

              {imageCount > 1 && (
                <div className="flex flex-wrap items-center gap-2" aria-label="Pilih foto">
                  {images.map((image, index) => (
                    <button
                      key={image.imageUrl}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Buka foto ${index + 1}`}
                      aria-current={index === activeImageIndex ? "true" : undefined}
                      className={`h-2.5 cursor-pointer rounded-full transition-[width,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-4 focus-visible:ring-offset-white ${index === activeImageIndex ? "w-9 bg-primary-600" : "w-2.5 bg-primary-100 hover:bg-primary-400"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
