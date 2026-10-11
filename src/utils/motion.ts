import { useReducedMotion } from 'motion/react';

/**
 * DAHR Luxury Motion System
 * Refined, understated, calm transitions (200ms–400ms) with full reduced-motion support.
 */

export const TRANSITION_FAST = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1],
};

export const TRANSITION_DEFAULT = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

export const TRANSITION_SLOW = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

// Subtle Page Route Fade
export const pageFadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Quiet Section Reveal on Scroll
export const editorialRevealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_SLOW,
  },
};

// Drawers (LTR: right, RTL: left)
export const getDrawerVariants = (isRtl: boolean) => ({
  hidden: {
    x: isRtl ? '-100%' : '100%',
    opacity: 0.95,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    x: isRtl ? '-100%' : '100%',
    opacity: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

// Modal Dialog Fade & Scale
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Backdrop Dimmer Fade
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Wishlist Heart Micro-Interaction
export const heartVariants = {
  initial: { scale: 1 },
  active: {
    scale: [1, 1.18, 1],
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export { useReducedMotion };
