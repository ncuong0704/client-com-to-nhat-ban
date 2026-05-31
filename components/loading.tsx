"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 h-16 md:h-20 flex items-center px-6">
        <SkeletonBox className="w-12 h-12 rounded-lg mr-3" />
        <div className="space-y-1.5">
          <SkeletonBox className="w-28 h-5" />
          <SkeletonBox className="w-20 h-3" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="pt-16 md:pt-20">
        <div className="relative min-h-[60vh] bg-muted animate-pulse flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <SkeletonBox className="w-72 h-10 mx-auto" />
            <SkeletonBox className="w-96 h-5 mx-auto" />
            <SkeletonBox className="w-36 h-12 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      {/* Menu section skeleton */}
      <div className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8 space-y-3">
            <SkeletonBox className="w-48 h-8 mx-auto" />
            <SkeletonBox className="w-80 h-4 mx-auto" />
          </div>
          {/* Category filter skeleton */}
          <div className="flex gap-3 mb-8 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} className="w-24 h-8 rounded-full flex-shrink-0" />
            ))}
          </div>
          {/* Dish card grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <SkeletonBox className="w-full aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <SkeletonBox className="w-3/4 h-4" />
                  <SkeletonBox className="w-full h-3" />
                  <SkeletonBox className="w-1/2 h-3" />
                  <div className="flex justify-between items-center pt-2">
                    <SkeletonBox className="w-20 h-5" />
                    <SkeletonBox className="w-16 h-3" />
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <SkeletonBox className="w-full h-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Loading({ autoReload = false, reloadDelay = 15000 }: { autoReload?: boolean; reloadDelay?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const initialCountdown = Math.ceil(reloadDelay / 1000)
  const [countdown, setCountdown] = useState(initialCountdown)
  const refreshKeyRef = useRef(0)

  useEffect(() => {
    if (!autoReload) return

    refreshKeyRef.current += 1
    const currentKey = refreshKeyRef.current
    setCountdown(initialCountdown)

    const countdownInterval = setInterval(() => {
      if (refreshKeyRef.current !== currentKey) {
        clearInterval(countdownInterval)
        return
      }
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    const reloadTimer = setTimeout(() => {
      if (refreshKeyRef.current === currentKey) {
        router.refresh()
      }
    }, reloadDelay)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(reloadTimer)
    }
  }, [autoReload, reloadDelay, router, initialCountdown, pathname])

  return (
    <div className="relative">
      <PageSkeleton />
      {autoReload && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/95 border border-border rounded-full px-4 py-2 text-sm text-muted-foreground shadow-md">
          Đang kết nối... thử lại sau {countdown}s
        </div>
      )}
    </div>
  )
}
