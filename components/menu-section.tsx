import { getDishData, getPaymentSettings, getAddressData } from "@/data/loaders"
import { MenuSectionProps } from "@/types"
import { Loading } from "./loading"
import { MenuSectionClient } from "./menu-section.client"


// Component wrapper async để fetch dữ liệu
export async function MenuSection({ menu, locale }: { menu: MenuSectionProps, locale: string }) {
  const [dishRes, paymentRes, addressRes] = await Promise.all([
    getDishData(locale),
    getPaymentSettings(),
    getAddressData(),
  ])
  if (!dishRes) {
    // Sử dụng timestamp để force remount component mỗi lần server component render
    // Khi router.refresh() được gọi, server component sẽ re-render và tạo key mới
    const refreshKey = `loading-${Date.now()}-${Math.random()}`
    return <Loading key={refreshKey} autoReload={true} reloadDelay={15000} />
  }

  const paymentData = paymentRes?.data?.attributes ?? paymentRes?.data ?? {};
  const qrImageUrl: string | null = paymentData?.bank_qr_image?.data?.attributes?.url
    ?? paymentData?.bank_qr_image?.url
    ?? null;
  const bankTransferInfo: string | null = paymentData?.bank_transfer_info ?? null;
  const branches = (addressRes?.data ?? []).map((b: any) => ({
    id: b.id,
    documentId: b.documentId,
    name: b.name ?? b.attributes?.name ?? '',
    address: b.address ?? b.attributes?.address ?? '',
    phone: b.phone ?? b.attributes?.phone ?? '',
  }));

  return (
    <MenuSectionClient
      menu={menu}
      dishes={dishRes?.data ?? []}
      locale={locale}
      qrImageUrl={qrImageUrl}
      bankTransferInfo={bankTransferInfo}
      branches={branches}
    />
  )
}
