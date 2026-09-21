"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

type Testimonial = {
  name: string;
  role: string;
  origin: string;
  photo: string;
  quote: string;
};

/** Rotating portrait stack, adapted from the supplied CircularTestimonials reference. */
export function CircularTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const contentId = useId();
  const count = testimonials.length;
  const currentIndex = count ? active % count : 0;
  const current = testimonials[currentIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(preference.matches);
    const syncVisibility = () => setTabVisible(document.visibilityState === "visible");
    syncMotion();
    syncVisibility();
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (count < 2 || paused || hovered || !visible || !tabVisible || reducedMotion) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % count), 5000);
    return () => window.clearInterval(timer);
  }, [count, paused, hovered, visible, tabVisible, reducedMotion]);

  function navigate(step: number) {
    if (count < 2) return;
    setPaused(true);
    setActive(index => (index + step + count) % count);
  }

  if (!current) return null;

  return (
    <div
      ref={root}
      className="circular-testimonials"
      role="region"
      aria-roledescription="carousel"
      aria-label="Cerita peserta Awan Event"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(true);
      }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          navigate(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="circular-testimonials__portraits"
        onTouchStart={event => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchCancel={() => { touchStart.current = null; }}
        onTouchEnd={event => {
          if (!touchStart.current) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - touchStart.current.x;
          const dy = touch.clientY - touchStart.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) navigate(dx < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        {testimonials.map((testimonial, index) => {
          const offset = (index - currentIndex + count) % count;
          const position = offset === 0 ? "active" : offset === 1 ? "next" : offset === count - 1 ? "previous" : "hidden";
          return (
            <div key={testimonial.name} className="circular-testimonials__portrait" data-position={position} aria-hidden={offset !== 0}>
              {failedPhotos.includes(testimonial.photo) ? (
                <span className="circular-testimonials__photo-fallback">Foto profil<br />belum tersedia</span>
              ) : (
                <Image
                  src={`https://images.unsplash.com/${testimonial.photo}?auto=format&fit=crop&w=800&h=1000&q=85`}
                  alt={`Foto ilustrasi profil ${testimonial.name}`}
                  fill
                  sizes="(max-width: 760px) 70vw, 360px"
                  draggable={false}
                  onError={() => setFailedPhotos(photos => photos.includes(testimonial.photo) ? photos : [...photos, testimonial.photo])}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="circular-testimonials__body">
        <div id={contentId} aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true">
          <article key={currentIndex} className="circular-testimonials__story">
            <header>
              <h3>{current.name}</h3>
              <p className="circular-testimonials__role">{current.role}<span aria-hidden="true">·</span>{current.origin}</p>
            </header>
            <blockquote>
              <span className="circular-testimonials__quote-mark" aria-hidden="true">“</span>
              <p className="sr-only">{current.quote}</p>
              <p aria-hidden="true" className="circular-testimonials__quote">
                {current.quote.split(" ").map((word, index) => (
                  <span key={`${index}-${word}`}><span className="circular-testimonials__word" style={{ "--word-delay": `${index * 20}ms` } as CSSProperties}>{word}</span>{" "}</span>
                ))}
              </p>
            </blockquote>
          </article>
        </div>
        {count > 1 && (
          <div className="circular-testimonials__controls">
            <div className="circular-testimonials__arrows">
              <button type="button" aria-label="Testimoni sebelumnya" aria-controls={contentId} onClick={() => navigate(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <button type="button" aria-label="Testimoni berikutnya" aria-controls={contentId} onClick={() => navigate(1)}><ArrowRight size={20} aria-hidden="true" /></button>
            </div>
            {!reducedMotion && (
              <button className="circular-testimonials__playback" type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Lanjutkan pergantian otomatis" : "Jeda pergantian otomatis"}>
                {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
                <span>{paused ? "Putar otomatis" : "Jeda otomatis"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
