"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BarChart3, GraduationCap, Heart, Pause, Play } from "lucide-react";
import { usePlatform } from "@/components/platform/provider";
import styles from "./learning-hero.module.css";

export function LearningHero() {
  const { state } = usePlatform();
  const cmsHome = state.cms["Home"];
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const personX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const personY = useTransform(springY, [-0.5, 0.5], [-8, 8]);
  const backgroundX = useTransform(springX, [-0.5, 0.5], [10, -10]);
  const motionEnabled = !paused && !reducedMotion && inView && pageVisible;

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!motionEnabled) {
      mouseX.set(0);
      mouseY.set(0);
      springX.jump(0);
      springY.jump(0);
    }
  }, [motionEnabled, mouseX, mouseY, springX, springY]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!motionEnabled || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title"
      data-motion={motionEnabled ? "running" : "paused"}
      onPointerMove={handlePointerMove} onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}>
      <div className={styles.decorations} aria-hidden="true">
        <motion.div style={{ x: backgroundX }} className={styles.circle} />
        <div className={`${styles.wave} ${styles.waveOne}`} />
        <div className={`${styles.wave} ${styles.waveTwo}`} />
        <div className={`${styles.wave} ${styles.waveThree}`} />
      </div>

      <div className={styles.layout}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={`${styles.title} ${styles.reveal}`}>
            {cmsHome?.title ? (
              <span>{cmsHome.title}</span>
            ) : (
              <>
                <span>Webinar, seminar,</span>{" "}
                <span>dan pelatihan</span>{" "}
                <span className={styles.titleAccent}>kesehatan.</span>
              </>
            )}
          </h1>
          <p className={`${styles.description} ${styles.reveal}`}>
            {cmsHome?.body || "Lihat program pendidikan dan pelatihan untuk tenaga kesehatan dan institusi."}
          </p>
          <div className={`${styles.actions} ${styles.reveal}`}>
            <a href="#event-list" className={`${styles.button} ${styles.primary}`}>
              <span className={styles.buttonLabel}>Lihat event mendatang</span>
            </a>
            <a href="#tentang" className={`${styles.button} ${styles.secondary}`}>Kenali Awan Event</a>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.personPosition}>
            <motion.div className={styles.personMotion} style={{ x: personX, y: personY }}>
              <div className={styles.personReveal}>
                <Image src={cmsHome?.image || "/brand/learning-professional.png"} alt={cmsHome?.image ? "Gambar program Awan Event" : "Profesional muda dengan tablet, siap belajar bersama Awan Event"} unoptimized={Boolean(cmsHome?.image)} fill priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1023px) 500px, 40vw" className={styles.personImage} />
              </div>
            </motion.div>
          </div>

          <div className={styles.desktopDetails}>
            <FloatingCard className={styles.knowledge}>
              <IconBox><GraduationCap size={21} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Materi kesehatan</p><p className={styles.cardCopy}>Untuk tenaga<br />kesehatan</p></div>
            </FloatingCard>
            <FloatingCard className={styles.competence} delay={0.7}>
              <IconBox><BarChart3 size={20} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Pelatihan</p><p className={styles.cardCopy}>Pengembangan<br />kompetensi</p></div>
            </FloatingCard>
            <FloatingCard className={styles.people} delay={1.5} rotate={-3}>
              <IconBox pink><Heart size={20} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Program institusi</p><p className={styles.cardCopy}>Sesuai kebutuhan<br />organisasi</p></div>
            </FloatingCard>
            <div className={styles.slogan}><p>Learn, Grow,<br />Bright Tomorrow.</p></div>
          </div>
        </div>
      </div>
      <button className={styles.motionToggle} type="button" aria-pressed={paused}
        aria-label={paused ? "Lanjutkan animasi hero" : "Jeda animasi hero"} onClick={() => setPaused(value => !value)}>
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        {paused ? "Lanjutkan animasi" : "Jeda animasi"}
      </button>
    </section>
  );
}

function FloatingCard({ children, className, delay = 0, rotate = 0 }: { children: ReactNode; className: string; delay?: number; rotate?: number }) {
  return <div className={`${styles.cardPosition} ${className}`} style={{ "--float-delay": `${delay}s`, "--float-duration": `${4 + delay}s`, "--card-rotation": `${rotate}deg` } as CSSProperties}>
    <div className={styles.cardFloat}><div className={styles.card}>{children}</div></div>
  </div>;
}

function IconBox({ children, pink = false }: { children: ReactNode; pink?: boolean }) {
  return <div className={`${styles.iconBox} ${pink ? styles.iconPink : ""}`}>{children}</div>;
}
