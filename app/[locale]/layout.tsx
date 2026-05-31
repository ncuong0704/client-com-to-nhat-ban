import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getGlobalData } from "@/data/loaders";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loading } from "@/components/loading";
import { getBaseUrl, getHreflangUrls } from "@/lib/seo-utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const hreflangUrls = getHreflangUrls(locale)
  const baseUrl = getBaseUrl()

  return {
    title: {
      default: 'Cơm Tô Nhật Bản | Donburi ngon mỗi ngày',
      template: '%s | Cơm Tô Nhật Bản'
    },
    description: 'Cơm Tô Nhật Bản - Donburi ngon mỗi ngày, giao hàng tận nơi.',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'vi_VN',
      url: `${baseUrl}/${locale}`,
      siteName: 'Cơm Tô Nhật Bản',
      ...(process.env.NEXT_PUBLIC_OG_IMAGE && {
        images: [{ url: process.env.NEXT_PUBLIC_OG_IMAGE, width: 1200, height: 630, alt: 'Cơm Tô Nhật Bản' }]
      }),
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: hreflangUrls
    }
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'vi'
  const data = await getGlobalData(locale)

  if (!data) {
    const refreshKey = `loading-${Date.now()}-${Math.random()}`
    return (
      <html lang={lang}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Loading key={refreshKey} autoReload={true} reloadDelay={15000} />
        </body>
      </html>
    )
  }

  const header = data.data.header
  const footer = data.data.footer

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {header && <Header header={header} />}
        {children}
        {footer && <Footer footer={footer} />}
      </body>
    </html>
  );
}
