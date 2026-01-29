"use client"

import { RefreshCw } from "lucide-react"
import { Potta_One } from "next/font/google"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"

const pottaOne = Potta_One({
  weight: "400",
  subsets: ["latin"],
})

export function Loading({ autoReload = false, reloadDelay = 15000 }: { autoReload?: boolean; reloadDelay?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const initialCountdown = Math.ceil(reloadDelay / 1000)
  const [countdown, setCountdown] = useState(initialCountdown)
  const refreshKeyRef = useRef(0)

  useEffect(() => {
    if (!autoReload) return

    // Tăng refresh key mỗi lần effect chạy để đảm bảo reset hoàn toàn
    refreshKeyRef.current += 1
    const currentKey = refreshKeyRef.current

    // Reset countdown ngay lập tức khi component mount hoặc pathname thay đổi
    setCountdown(initialCountdown)

    // Countdown timer - giảm mỗi giây
    const countdownInterval = setInterval(() => {
      // Kiểm tra xem component có còn đang active không (tránh race condition)
      if (refreshKeyRef.current !== currentKey) {
        clearInterval(countdownInterval)
        return
      }

      setCountdown((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Reload timer - refresh route sau reloadDelay
    const reloadTimer = setTimeout(() => {
      // Kiểm tra xem component có còn đang active không
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>

        {/* Title */}
        <h1 className={`${pottaOne.className} text-2xl font-bold text-foreground mb-2`}>
          Web đang chuẩn bị
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground mb-8">
          {autoReload ? `Đang tải lại trang sau ${countdown} giây...` : "Vui lòng đợi trong giây lát."}
        </p>
      </div>
    </div>
  )
}

