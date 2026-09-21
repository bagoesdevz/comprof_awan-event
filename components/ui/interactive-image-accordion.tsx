"use client";

import Image from "next/image";
import { Images } from "lucide-react";
import { type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import { GalleryLightbox, type GalleryLightboxImage } from "@/components/ui/gallery-lightbox";

export type InteractiveImageAccordionItem = {
  id: string;
  title: string;
  description: string;
  images: GalleryLightboxImage[];
};

type InteractiveImageAccordionProps = {
  items: InteractiveImageAccordionItem[];
  defaultActiveIndex?: number;
  ariaLabel?: string;
};

function clampIndex(index: number, itemCount: number) {
  return Math.max(0, Math.min(index, Math.max(0, itemCount - 1)));
}

export function InteractiveImageAccordion({
  items,
  defaultActiveIndex = 0,
  ariaLabel = "Galeri dokumentasi kegiatan",
}: InteractiveImageAccordionProps) {
  const initialIndex = clampIndex(defaultActiveIndex, items.length);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (items.length === 0) return null;

  function activateAndFocus(index: number) {
    const nextIndex = clampIndex(index, items.length);
    setActiveIndex(nextIndex);
    itemRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex === undefined) return;
    event.preventDefault();
    activateAndFocus(nextIndex);
  }

  function handleGalleryOpenChange(open: boolean) {
    if (open) return;

    const triggerIndex = selectedItemIndex;
    setSelectedItemIndex(null);
    window.requestAnimationFrame(() => {
      if (triggerIndex !== null) itemRefs.current[triggerIndex]?.focus();
    });
  }

  return (
    <div className="flex w-full flex-col gap-3 md:h-[560px] md:flex-row md:gap-4" role="group" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const coverImage = item.images[0];
        if (!coverImage) return null;

        const isActive = index === activeIndex;
        const growthStyle = { "--accordion-grow": isActive ? 5 : 0.72 } as CSSProperties;

        return (
          <button
            key={item.id}
            ref={(node) => { itemRefs.current[index] = node; }}
            type="button"
            style={growthStyle}
            aria-pressed={isActive}
            aria-label={`Buka galeri ${item.title}, ${item.images.length} foto. ${item.description}`}
            aria-haspopup="dialog"
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => {
              setActiveIndex(index);
              setSelectedItemIndex(index);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`group relative w-full cursor-pointer overflow-hidden border border-white/15 text-left text-white transition-[height,flex-grow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-primary-100 md:h-full md:min-w-0 md:basis-0 md:[flex-grow:var(--accordion-grow)] ${isActive ? "h-[360px] rounded-[28px_28px_28px_6px]" : "h-20 rounded-[20px_20px_20px_6px] md:rounded-[24px_24px_24px_6px]"}`}
          >
            <Image
              src={coverImage.imageUrl}
              alt=""
              fill
              priority={index === initialIndex}
              sizes="(min-width: 1280px) 720px, (min-width: 768px) 58vw, calc(100vw - 32px)"
              className={`object-cover transition duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${isActive ? "scale-100 saturate-100" : "scale-105 saturate-[.72] md:scale-110"}`}
            />
            <span className={`absolute inset-0 transition-colors duration-500 ${isActive ? "bg-gradient-to-t from-primary-950 via-primary-950/18 to-transparent" : "bg-primary-950/65 md:bg-primary-950/55"}`} aria-hidden="true" />
            <span className="absolute inset-0 border border-white/0 transition group-hover:border-white/20" aria-hidden="true" />

            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 block p-6 sm:p-8">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary-300">Dokumentasi / {String(index + 1).padStart(2, "0")}</span>
                <span className="mt-3 block max-w-xl text-3xl font-semibold leading-none tracking-[-0.045em] sm:text-4xl">{item.title}</span>
                <span className="mt-3 block max-w-lg text-sm leading-6 text-white/68">{item.description}</span>
                <span className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 text-[11px] font-semibold backdrop-blur"><Images className="h-4 w-4" aria-hidden="true" /> Buka {item.images.length} foto</span>
              </span>
            ) : (
              <span className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 items-center justify-between gap-4 md:inset-x-auto md:bottom-7 md:left-1/2 md:top-auto md:block md:-translate-x-1/2 md:translate-y-0 md:[writing-mode:vertical-rl] md:rotate-180">
                <span className="text-sm font-semibold tracking-[-0.02em] md:whitespace-nowrap">{item.title}</span>
                <span className="font-mono text-[9px] text-primary-300 md:mt-4">{String(index + 1).padStart(2, "0")}</span>
              </span>
            )}
          </button>
        );
      })}

      {selectedItemIndex !== null && items[selectedItemIndex] && (
        <GalleryLightbox
          open
          onOpenChange={handleGalleryOpenChange}
          title={items[selectedItemIndex].title}
          description={items[selectedItemIndex].description}
          images={items[selectedItemIndex].images}
        />
      )}
    </div>
  );
}

export const LandingAccordionItem = InteractiveImageAccordion;
export default InteractiveImageAccordion;
