import { Loading } from "@/components/loading"
import { SectionRenderer } from "@/components/SectionRenderer"
import { buildMetadata } from "@/components/seo"
import { getLandingPageData } from "@/data/loaders"
import { Metadata } from "next"
import { cache } from "react"

const getDataCached = cache(getLandingPageData);

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params
  const data = await getDataCached(locale)
  if (!data) {
    // Sử dụng timestamp để force remount component mỗi lần server component render
    // Khi router.refresh() được gọi, server component sẽ re-render và tạo key mới
    const refreshKey = `loading-${Date.now()}-${Math.random()}`
    return <Loading key={refreshKey} autoReload={true} reloadDelay={15000} />
  }
  const blocks = data.data.blocks
  return (
    <main>
      <div className="min-h-screen">
        <SectionRenderer sections={blocks} locale={locale} />
      </div>
    </main>
  )
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const data = await getDataCached(locale)
  return buildMetadata(data?.data?.seo)
}