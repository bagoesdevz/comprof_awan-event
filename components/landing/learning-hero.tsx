"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BarChart3, GraduationCap, Heart, Lightbulb, Pause, Play, UsersRound } from "lucide-react";
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
        <motion.div style={{ x: backgroundX }} className={styles.glowPosition}><div className={styles.glowRight} /></motion.div>
        <div className={styles.glowCenter} />
        <div className={styles.circle} />
        <div className={styles.orbit} />
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
                <span>Pendidikan Berkualitas</span>{" "}
                <span>untuk Masa Depan</span>{" "}
                <span className={styles.titleAccent}>yang Lebih Baik.</span>
              </>
            )}
          </h1>
          <p className={`${styles.description} ${styles.reveal}`}>
            {cmsHome?.body || "Webinar, seminar, dan pelatihan untuk mengembangkan kompetensi Anda."}
          </p>
          <div className={`${styles.actions} ${styles.reveal}`}>
            <a href="#event-list" className={`${styles.button} ${styles.primary}`}>
              <span className={styles.shine} aria-hidden="true" />
              <span className={styles.buttonLabel}>Lihat Program Kami</span>
            </a>
            <a href="#tentang" className={`${styles.button} ${styles.secondary}`}>Kenali Awan Event</a>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.personPosition}>
            <motion.div className={styles.personMotion} style={{ x: personX, y: personY }}>
              <div className={styles.personReveal}>
                <Image src="/brand/learning-professional.png" alt="Profesional muda dengan tablet, siap belajar bersama Awan Event" fill priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1023px) 500px, 40vw" className={styles.personImage} />
              </div>
            </motion.div>
          </div>

          <div className={styles.desktopDetails}>
            <FloatingCard className={styles.knowledge}>
              <IconBox><GraduationCap size={21} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Ilmu hari ini</p><p className={styles.cardCopy}>Kesempatan<br />masa depan</p></div>
            </FloatingCard>
            <FloatingCard className={styles.competence} delay={0.7}>
              <IconBox><BarChart3 size={20} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Kompetensi</p><p className={styles.cardCopy}>Untuk dampak<br />yang nyata</p></div>
            </FloatingCard>
            <FloatingCard className={styles.alumni} delay={1.1} rotate={-5}>
              <IconBox><UsersRound size={21} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardNumber}>100+</p><p className={styles.cardCopy}>Alumni berkembang</p></div>
            </FloatingCard>
            <FloatingCard className={styles.people} delay={1.5} rotate={-3}>
              <IconBox pink><Heart size={20} aria-hidden="true" /></IconBox>
              <div><p className={styles.cardTitle}>Manusia</p><p className={styles.cardCopy}>Lebih siap.<br />Lebih berdaya.</p></div>
            </FloatingCard>
            <div className={styles.quote}><Lightbulb size={25} aria-hidden="true" /><p>Investasi terbaik<br />adalah ilmu.</p></div>
            <div className={styles.slogan}><p>Learn,<br />Grow,<br />Bright<br />Tomorrow.</p></div>
            <FloatingBall className={styles.ballOne} delay={0} />
            <FloatingBall className={styles.ballTwo} delay={1} />
            <FloatingBall className={styles.ballThree} delay={2} />
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

function FloatingBall({ className, delay }: { className: string; delay: number }) {
  return <div aria-hidden="true" className={`${styles.ball} ${className}`} style={{ animationDelay: `${delay}s` }} />;
}
