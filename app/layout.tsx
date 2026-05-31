import type { Metadata } from "next"
import { getBaseUrl, getHreflangUrls } from "@/lib/seo-utils"

const baseUrl = getBaseUrl()
const hreflangUrls = getHreflangUrls('vi')

export const metadata: Metadata = {
  title: {
    default: 'Cơm Tô Nhật Bản | Donburi ngon mỗi ngày',
    template: '%s | Cơm Tô Nhật Bản'
  },
  description: 'Nhà hàng cơm tô Nhật Bản (Donburi) – món ngon mỗi ngày, giao hàng tận nơi.',
  verification: {
    google: 'xW-PlbVDPUy2XflZZkESv1FrXWTQBFcZw9BQNyDm7Qg',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: baseUrl,
    siteName: 'Cơm Tô Nhật Bản',
    ...(process.env.NEXT_PUBLIC_OG_IMAGE && {
      images: [{ url: process.env.NEXT_PUBLIC_OG_IMAGE, width: 1200, height: 630, alt: 'Cơm Tô Nhật Bản' }]
    }),
  },
  alternates: {
    canonical: baseUrl,
    languages: hreflangUrls
  }
}

// html/body are provided by app/[locale]/layout.tsx for correct lang attribute
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
