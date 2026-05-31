"use client"

import { useEffect, useRef, useState } from "react"

interface RevealSectionProps {
  children: React.ReactNode
  /** delay in ms for staggered animations */
  delayMs?: number
  /** distance to slide from, in Tailwind spacing (e.g., 6 => translate-y-6) */
  slide?: 6 | 8 | 10
}

export function RevealSection({ children, delayMs = 0, slide = 6 }: RevealSectionProps) {
  const clampedDelay = Math.min(delayMs, 300)
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), clampedDelay)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [delayMs])

  const hiddenClass = slide === 10 ? "translate-y-10" : slide === 8 ? "translate-y-8" : "translate-y-6"

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${hiddenClass}`
      }`}
    >
      {children}
    </div>
  )
}


