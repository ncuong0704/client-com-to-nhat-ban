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
  if (!data || !data.data) {
    return <Loading />
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