"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Potta_One } from "next/font/google"

const pottaOne = Potta_One({
  weight: "400",
  subsets: ["latin"],
})

export function Loading() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

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
          Trang đang cập nhật
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Chúng tôi đang cập nhật trang web. Vui lòng thử lại sau ít phút.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  )
}

