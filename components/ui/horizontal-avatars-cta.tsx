"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./horizontal-avatars-cta.module.css";

export interface HorizontalAvatar {
  src: string;
  alt: string;
}

export interface HorizontalAvatarsCTAProps {
  title: ReactNode;
  description: ReactNode;
  buttonText: string;
  buttonHref: string;
  avatars: HorizontalAvatar[];
  className?: string;
  id?: string;
}

export function HorizontalAvatarsCTA({
  title,
  description,
  buttonText,
  buttonHref,
  avatars,
  className,
  id,
}: HorizontalAvatarsCTAProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.12 });
  const reducedMotion = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);
  const motionEnabled = inView && !reducedMotion && pageVisible;

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(styles.cta, className)}
      data-motion={motionEnabled ? "running" : "paused"}
      aria-labelledby={id ? id + "-title" : undefined}
    >
      <div className={styles.decorations} aria-hidden="true">
        <div className={styles.glow} />
        <div className={cn(styles.ring, styles.ringSmall)} />
        <div className={cn(styles.ring, styles.ringLarge)} />
        <div className={cn(styles.wave, styles.waveOne)} />
        <div className={cn(styles.wave, styles.waveTwo)} />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 18 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.eyebrow}>Bergabung dan berkembang bersama</span>
        <h2 id={id ? id + "-title" : undefined}>{title}</h2>
        <p>{description}</p>
        <a className={styles.button} href={buttonHref}>{buttonText}</a>
      </motion.div>

      <div className={styles.avatarRail} aria-label="Peserta yang belajar bersama Awan Event">
        {avatars.map((avatar, index) => (
          <motion.div
            key={avatar.src + "-" + index}
            className={styles.avatarItem}
            initial={{ opacity: 0, y: 18 }}
            animate={
              motionEnabled
                ? { opacity: 1, y: [0, -8, 0] }
                : { opacity: inView ? 1 : 0, y: inView ? 0 : 18 }
            }
            transition={
              motionEnabled
                ? { opacity: { duration: 0.45, delay: index * 0.08 }, y: { duration: 4.8, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" } }
                : { duration: 0.45, delay: index * 0.05 }
            }
            whileHover={reducedMotion ? undefined : { y: -7, scale: 1.06 }}
          >
            <Image
              src={avatar.src}
              alt={avatar.alt}
              fill
              sizes="(max-width: 639px) 48px, 68px"
              className={styles.avatar}
              unoptimized
            />
          </motion.div>
        ))}
      </div>

      <span className={styles.note}>Komunitas belajar yang terus bertumbuh</span>
    </section>
  );
}

