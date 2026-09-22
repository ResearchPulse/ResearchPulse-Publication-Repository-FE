'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: Parameters<Lenis['scrollTo']>[1]
  ) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

let globalLenisInstance: Lenis | null = null;

export function smoothScrollTo(
  target: string | HTMLElement | number,
  options?: Parameters<Lenis['scrollTo']>[1]
) {
  if (globalLenisInstance) {
    globalLenisInstance.scrollTo(target, options);
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el && 'scrollIntoView' in el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Respect user's preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const instance = new Lenis({
      duration: prefersReducedMotion ? 0.1 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      allowNestedScroll: true,
      prevent: (node: HTMLElement) => {
        if (!node) return false;

        // 1. Explicit data attributes
        if (
          node.hasAttribute?.('data-lenis-prevent') ||
          node.hasAttribute?.('data-lenis-prevent-wheel') ||
          node.closest?.('[data-lenis-prevent], [data-lenis-prevent-wheel]')
        ) {
          return true;
        }

        // 2. Modals, dialogs, PDF viewer, dropdown popups
        if (
          node.closest?.(
            '[role="dialog"], [aria-modal="true"], .modal, .dropdown-menu, [data-prevent-lenis], iframe'
          )
        ) {
          return true;
        }

        return false;
      },
    });

    lenisRef.current = instance;
    globalLenisInstance = instance;
    setLenis(instance);

    let rafId: number;
    function raf(time: number) {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept clicks on internal anchor links (#hash) for ultra-smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;
      const hash = href.slice(hashIndex);
      if (hash.length <= 1) return;

      const pathBeforeHash = href.slice(0, hashIndex);
      // If navigating to another page's hash, let Next.js router handle it
      if (
        pathBeforeHash &&
        pathBeforeHash !== window.location.pathname &&
        pathBeforeHash !== '/'
      ) {
        return;
      }

      try {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          instance.scrollTo(targetEl as HTMLElement, {
            offset: -88,
            duration: 1.15,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      } catch {
        // In case hash is not a valid CSS selector
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      instance.destroy();
      lenisRef.current = null;
      globalLenisInstance = null;
      setLenis(null);
    };
  }, []);

  // Recalculate dimensions on route change
  useEffect(() => {
    if (lenisRef.current) {
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
        if (!window.location.hash) {
          lenisRef.current?.scrollTo(0, { immediate: true });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const scrollTo = (
    target: string | HTMLElement | number,
    options?: Parameters<Lenis['scrollTo']>[1]
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
