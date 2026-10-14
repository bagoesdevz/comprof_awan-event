"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./person-card.module.css";

type PersonCardProps = {
  name: string;
  role: string;
  photo?: string;
  organization?: string;
  bio?: string;
  badge?: string;
};

export function PersonCard({ name, role, photo, organization, bio, badge }: PersonCardProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo]);

  return <article className={styles.card}>
    <div className={styles.portrait}>
      {photo && !failed ? <Image
        src={photo} alt={`Foto ${name}`} fill unoptimized
        sizes="(max-width: 619px) 92vw, (max-width: 999px) 45vw, 390px"
        className={styles.photo} onError={() => setFailed(true)}
      /> : <div className={styles.skeleton} role="img" aria-label={`Foto ${name} belum tersedia`}>
        <span className={styles.skeletonHead} aria-hidden="true" />
        <span className={styles.skeletonBody} aria-hidden="true" />
        <span className={styles.placeholderLabel}>Foto belum tersedia</span>
      </div>}
      {badge && <span className={styles.badge}>{badge}</span>}
    </div>
    <div className={styles.identity}>
      <h3>{name}</h3>
      {role && <p className={styles.role}>{role}</p>}
      {organization && <p className={styles.organization}>{organization}</p>}
    </div>
    {bio && <p className={styles.bio}>{bio}</p>}
  </article>;
}

export function PersonGrid({ children, count }: { children: React.ReactNode; count: number }) {
  return <div className={styles.wrapper} data-count={count}><div className={styles.grid}>{children}</div></div>;
}
