// app/layout.tsx
import type { Metadata } from "next"
import { getBaseUrl, getHreflangUrls } from "@/lib/seo-utils"

type Props = { children: React.ReactNode }
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
  },
  alternates: {
    canonical: baseUrl,
    languages: hreflangUrls
  }
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="vi" className="mdl-js">
      <head>
        <link rel="alternate" hrefLang="vi" href={hreflangUrls.vi} />
        <link rel="alternate" hrefLang="en" href={hreflangUrls.en} />
        <link rel="alternate" hrefLang="x-default" href={hreflangUrls['x-default']} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}