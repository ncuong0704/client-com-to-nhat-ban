"use client"

import { DishCard } from "@/components/dish-card"
import { OrderModal } from "@/components/order-modal"
import { RevealSection } from "@/components/reveal-section"
import { Button } from "@/components/ui/button"
import { MenuSectionProps } from "@/types"
import { useMemo, useState } from "react"

export interface Dish {
  id: number
  documentId: string
  name: string
  description: string
  image: {
    id: number
    documentId: string
    url: string
    alternativeText: string | null
  }
  category_dish: {
    id: number
    documentId: string
    name: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    locale: string
    order: number | null
  } | null
  price: number
  sold: number
  likes: number
  soldOut: boolean
  badges?: Array<{
    name: string
    color: string
  }>
  add?: Array<{
    __component: "elements.add-radio-list" | "elements.add-checkbox-list"
    id: number
    title: string
    list: Array<{
      id: number
      name: string
      price: number | null
    }>
  }>
}

// Component chính sử dụng hooks
export function MenuSectionClient({ menu, dishes, locale }: { 
  menu: MenuSectionProps, 
  dishes: Dish[], 
  locale: string 
}) {
  const [orderOpen, setOrderOpen] = useState(false)
  
  // Tính order cho từng category dựa trên category_dish.order (nhỏ trước, null coi như lớn)
  const categoryOrderMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of dishes ?? []) {
      const name = d.category_dish?.name || 'Không xác định'
      const order = d.category_dish?.order ?? Number.POSITIVE_INFINITY
      if (!map.has(name) || (map.get(name)! > order)) {
        map.set(name, order)
      }
    }
    return map
  }, [dishes])

  // Lấy danh sách categories theo thứ tự order
  const categories = useMemo(() => {
    const uniq = Array.from(new Set(dishes?.map((d: Dish) => d.category_dish?.name || 'Không xác định') ?? []))
    return uniq.sort((a, b) => (categoryOrderMap.get(a) ?? Infinity) - (categoryOrderMap.get(b) ?? Infinity))
  }, [dishes, categoryOrderMap])

  const categoriesWithAll = ["Tất cả", ...categories]
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả")

  const scrollTo = (scrollTo: string) => {
    document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" })
  }

  const filteredDishes = useMemo(() => {
    const list = activeCategory === "Tất cả"
      ? (dishes ?? [])
      : (dishes?.filter((d: Dish) => (d.category_dish?.name || 'Không xác định') === activeCategory) ?? [])
    // Sắp xếp món theo order của category (nhỏ trước), sau đó theo tên để ổn định
    return list.slice().sort((a, b) => {
      const oa = a.category_dish?.order ?? Number.POSITIVE_INFINITY
      const ob = b.category_dish?.order ?? Number.POSITIVE_INFINITY
      if (oa !== ob) return oa - ob
      return a.name.localeCompare(b.name, 'vi')
    })
  }, [activeCategory, dishes])

  const [cartItems, setCartItems] = useState<Array<{
    dishId: string
    name: string
    image: string
    description: string
    quantity: number
    unitPrice: number
    toppingTotal: number
    total: number
    toppings: string[]
    isSpicy: boolean | null
    notes?: string
  }>>([])

  function handleAddToCart(payload: {
    dishId: string
    name: string
    image: string
    description: string
    quantity: number
    unitPrice: number
    toppingTotal: number
    total: number
    toppings: string[]
    isSpicy: boolean | null
    notes?: string
  }) {
    setCartItems((prev) => [...prev, payload])
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <>
      <section id="menu" className="py-8 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection slide={10}>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-primary">
                {menu.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {menu.description}
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Category Filters - Sticky */}
      <div id="category-filters"></div>
      <div  className="sticky top-[64px] md:top-[81px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 pb-2 min-w-max">
              {categoriesWithAll.map((cat) => {
                const isActive = cat === activeCategory
                return (
                  <Button
                    key={cat as string}
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    aria-pressed={isActive}
                    onClick={() => {setActiveCategory(cat as string); scrollTo("category-filters")}}
                    className={`${isActive ? "" : "border-border"} cursor-pointer whitespace-nowrap flex-shrink-0`}
                  >
                    {cat as string}
                  </Button>
                )
              })}
            </div>
          </div>
          
          {/* Desktop: Wrap layout */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-4">
            {categoriesWithAll.map((cat) => {
              const isActive = cat === activeCategory
              return (
                <Button
                  key={cat as string}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  aria-pressed={isActive}
                  onClick={() => {setActiveCategory(cat as string); scrollTo("category-filters")}}
                  className={`${isActive ? "" : "border-border"} cursor-pointer`}
                >
                  {cat as string}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredDishes.map((dish: Dish, idx: number) => (
              <RevealSection key={dish.documentId} delayMs={idx}>
                <DishCard dish={dish} onOrder={() => {}} onAddToCart={handleAddToCart} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <OrderModal
        dish={null}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        cartCount={cartCount}
        cartTotal={cartTotal}
        cartItems={cartItems}
        onUpdateItem={(index, quantity) => {
          setCartItems((prev) => {
            const next = [...prev]
            const item = next[index]
            if (!item) return prev
            const newItem = { ...item, quantity }
            newItem.total = (newItem.unitPrice + newItem.toppingTotal) * newItem.quantity
            next[index] = newItem
            return next
          })
        }}
        onRemoveItem={(index) => {
          setCartItems((prev) => prev.filter((_, i) => i !== index))
        }}
        onClearCart={() => setCartItems([])}
      />

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="rounded-xl border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg p-4 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold">{cartCount.toLocaleString("vi-VN")} món đã chọn</div>
                <div className="text-muted-foreground">Tổng: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(cartTotal)}</div>
              </div>
              <Button className="rounded-full cursor-pointer" onClick={() => setOrderOpen(true)}>Giao hàng</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


