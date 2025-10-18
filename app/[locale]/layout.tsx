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

  // Get locale-specific metadata
  const localeNames = {
    vi: 'Tiếng Việt',
    en: 'English',
  }

  const localeName = localeNames[locale as keyof typeof localeNames] || 'Tiếng Việt'

  return {
    title: {
      default: `Cơm Tô Nhật Bản | Donburi ngon mỗi ngày - ${localeName}`,
      template: `%s | Cơm Tô Nhật Bản - ${localeName}`
    },
    description: `Cơm Tô Nhật Bản - Donburi ngon mỗi ngày, giao hàng tận nơi. - ${localeName}`,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : locale === 'en' ? 'en_US' : 'vi_VN',
      url: `${baseUrl}/${locale}`,
      siteName: 'Cơm Tô Nhật Bản',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: hreflangUrls
    }
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params
  const data = await getGlobalData(locale)
  if (!data) {
    return <Loading />
  }
  const header = data.data.header
  const footer = data.data.footer
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {header && <Header header={header} />}
      {children}
      {footer && <Footer footer={footer} />}
    </div>
  );
}
