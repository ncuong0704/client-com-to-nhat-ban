import { getDishData } from "@/data/loaders"
import { MenuSectionProps } from "@/types"
import { Loading } from "./loading"
import { MenuSectionClient } from "./menu-section.client"


// Component wrapper async để fetch dữ liệu
export async function MenuSection({ menu, locale }: { menu: MenuSectionProps, locale: string }) {
  const [dishRes] = await Promise.all([
    getDishData(locale),
  ])
  if (!dishRes) {
    return <Loading />
  }
  return (
    <MenuSectionClient 
      menu={menu} 
      dishes={dishRes?.data ?? []} 
      locale={locale} 
    />
  )
}
