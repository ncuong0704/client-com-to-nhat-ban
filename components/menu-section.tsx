"use client"

import { useState } from "react"
import { DishCard } from "@/components/dish-card"
import { OrderModal } from "@/components/order-modal"
import { Button } from "@/components/ui/button"

export interface Dish {
  id: string
  name: string
  description: string
  image: string
  category: string
  price: number
  sold: number
  likes: number
}

const dishes: Dish[] = [
  {
    id: "1",
    name: "Phở Bò",
    description: "Traditional Vietnamese beef noodle soup with aromatic herbs and tender beef slices.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Mì/Noodle",
    price: 69000,
    sold: 1245,
    likes: 980,
  },
  {
    id: "2",
    name: "Bún Chả",
    description: "Grilled pork with vermicelli noodles, fresh herbs, and sweet fish sauce.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Bún/Vermicelli",
    price: 59000,
    sold: 980,
    likes: 750,
  },
  {
    id: "3",
    name: "Cơm Gà Hải Nam",
    description: "Hainanese chicken rice with fragrant rice cooked in chicken broth.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Cơm/Rice",
    price: 75000,
    sold: 860,
    likes: 690,
  },
  {
    id: "4",
    name: "Gỏi Cuốn",
    description: "Fresh spring rolls with shrimp, pork, vegetables, and peanut dipping sauce.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Khai vị/Appetizer",
    price: 39000,
    sold: 540,
    likes: 430,
  },
  {
    id: "5",
    name: "Bánh Mì Thịt Nướng",
    description: "Vietnamese baguette with grilled pork, pickled vegetables, and fresh cilantro.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Bánh mì/Sandwich",
    price: 45000,
    sold: 1120,
    likes: 870,
  },
  {
    id: "6",
    name: "Bún Bò Huế",
    description: "Spicy beef noodle soup from Hue with lemongrass and thick rice noodles.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Mì/Noodle",
    price: 79000,
    sold: 720,
    likes: 600,
  },
  {
    id: "7",
    name: "Cá Kho Tộ",
    description: "Caramelized fish in clay pot with rich savory-sweet sauce and black pepper.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Món mặn/Main",
    price: 99000,
    sold: 410,
    likes: 350,
  },
  {
    id: "8",
    name: "Chè Ba Màu",
    description: "Three-color dessert with sweet beans, jelly, coconut milk, and crushed ice.",
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    category: "Tráng miệng/Dessert",
    price: 30000,
    sold: 650,
    likes: 520,
  },
]

export function MenuSection() {
  const [orderOpen, setOrderOpen] = useState(false)
  const categories = Array.from(new Set(dishes.map((d) => d.category)))
  const categoriesWithAll = ["Tất cả", ...categories]
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả")

  const filteredDishes = activeCategory === "Tất cả" ? dishes : dishes.filter((d) => d.category === activeCategory)

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
      <section id="menu" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-primary">
              Món ăn đặc trưng của chúng tôi
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Ẩm thực Nhật đích thực được chế biến theo công thức truyền thống và nguyên liệu tươi ngon.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-10 md:mb-12">
            {categoriesWithAll.map((cat) => {
              const isActive = cat === activeCategory
              return (
                <Button
                  key={cat}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(cat)}
                  className={`${isActive ? "" : "border-border"} cursor-pointer`}
                >
                  {cat}
                </Button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onOrder={() => {}} onAddToCart={handleAddToCart} />
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
