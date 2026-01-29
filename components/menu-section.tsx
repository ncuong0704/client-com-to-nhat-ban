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
    // Sử dụng timestamp để force remount component mỗi lần server component render
    // Khi router.refresh() được gọi, server component sẽ re-render và tạo key mới
    const refreshKey = `loading-${Date.now()}-${Math.random()}`
    return <Loading key={refreshKey} autoReload={true} reloadDelay={15000} />
  }
  return (
    <MenuSectionClient 
      menu={menu} 
      dishes={dishRes?.data ?? []} 
      locale={locale} 
    />
  )
}
