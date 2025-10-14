import { getStrapiURL } from "@/utils/get-strapi-url"
import type { Metadata } from "next"

function toAbsoluteUrl(url?: string | null) {
  if (!url) return undefined
  if (url.startsWith("http") || url.startsWith("//") || url.startsWith("data:")) return url
  return getStrapiURL() + url
}

export async function buildMetadata(seo: any): Promise<Metadata> {
  try {
    if (!seo) return {}

    const title = seo.metaTitle || "Cơm Tô Nhật Bản | Donburi ngon mỗi ngày"
    const description = seo.metaDescription || "Cơm Tô Nhật Bản - Donburi ngon mỗi ngày, giao hàng tận nơi."
    const keywords = seo.keywords ? String(seo.keywords).split(",").map((k: string) => k.trim()).filter(Boolean) : undefined
    const canonical = seo.canonicalURL || undefined

    const metaImage = toAbsoluteUrl(seo.metaImage?.url)
    const ogImage = toAbsoluteUrl(seo.openGraph?.ogImage?.url)

    const structuredData = typeof seo.structuredData === 'string' && seo.structuredData.trim().length > 0
      ? seo.structuredData
      : undefined

    const metaRobots: string | undefined = seo.metaRobots || undefined
    const robots = metaRobots ? {
      index: !/noindex/i.test(metaRobots),
      follow: !/nofollow/i.test(metaRobots)
    } : undefined

    const allowedOgTypes = new Set([
      'website', 'article', 'book', 'profile',
      'music.song', 'music.album', 'music.playlist', 'music.radio_station',
      'video.movie', 'video.episode', 'video.tv_show', 'video.other'
    ])
    const ogType = typeof seo.openGraph?.ogType === 'string' && allowedOgTypes.has(seo.openGraph.ogType)
      ? (seo.openGraph.ogType as any)
      : undefined

    const baseOg = {
      title: seo.openGraph?.ogTitle || title,
      description: seo.openGraph?.ogDescription || description,
      url: seo.openGraph?.ogUrl || canonical,
      images: [ogImage || metaImage].filter(Boolean) as string[],
    } as any
    if (ogType) baseOg.type = ogType

    return {
      title,
      description,
      keywords,
      alternates: canonical ? { canonical } : undefined,
      robots,
      openGraph: baseOg,
      twitter: {
        card: 'summary_large_image',
        title: seo.openGraph?.ogTitle || title,
        description: seo.openGraph?.ogDescription || description,
        images: [ogImage || metaImage].filter(Boolean) as string[]
      },
      other: structuredData ? { 'script:ld+json': structuredData } as any : undefined,
    }
  } catch {
    return {}
  }
}


