"use client";

import { useEffect } from "react";

export function MotionObserver() {
  useEffect(() => {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;
    document.documentElement.classList.add("motion-ready");
    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -5%" },
    );

    const observeContent = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        if (observed.has(element)) return;
        observed.add(element);
        observer.observe(element);
      });
    };
    observeContent();
    const mutations = new MutationObserver(observeContent);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); document.documentElement.classList.remove("motion-ready"); };
  }, []);

  return null;
}
