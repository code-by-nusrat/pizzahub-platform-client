// Save as: src/lib/motion-variants.ts
// Shared animation settings so every section moves the same way.
import type { Variants } from "motion/react"

// Smooth "ease out": starts fast, settles gently
export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Animate once, when the section is 80px inside the screen
export const viewport = { once: true, margin: "0px 0px -80px 0px" } as const

// Parent: animates its children one after another
export const stagger = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
})

// Child: fades in while rising a little
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

// Child: fades in while sliding from the right
export const slideIn: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
}

// Child: small springy pop
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
}