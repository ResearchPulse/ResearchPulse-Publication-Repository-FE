'use client';

import { useEffect, useLayoutEffect } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ScrollRevealObserver() {
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const landing = document.querySelector('.public-landing');
    const revealElements = document.querySelectorAll('.pl-reveal');
    const frameIds = new Set<number>();

    const revealAfterPaint = (element: Element) => {
      const firstFrame = window.requestAnimationFrame(() => {
        const secondFrame = window.requestAnimationFrame(() => {
          element.classList.add('is-revealed');
        });
        frameIds.add(secondFrame);
      });
      frameIds.add(firstFrame);
    };

    // If user prefers reduced motion, reveal everything immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Keep content visible if the browser does not support IntersectionObserver.
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    landing?.classList.add('pl-motion-ready');

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealAfterPaint(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
      observer.disconnect();
      landing?.classList.remove('pl-motion-ready');
    };
  }, []);

  return null;
}
