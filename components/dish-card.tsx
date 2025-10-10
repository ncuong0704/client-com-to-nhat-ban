"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Dish } from "@/components/menu-section"

interface DishCardProps {
  dish: Dish
  onOrder: () => void
  onAddToCart?: (payload: {
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
  }) => void
}

export function DishCard({ dish, onOrder, onAddToCart }: DishCardProps) {
  const [open, setOpen] = React.useState(false)
  const [isSpicy, setIsSpicy] = React.useState<boolean | null>(null)
  const [toppings, setToppings] = React.useState<Record<string, { selected: boolean; price: number }>>({
    "Thêm trứng": { selected: false, price: 10000 },
    "Thêm thịt": { selected: false, price: 20000 },
    "Thêm rau": { selected: false, price: 5000 },
  })
  const [quantity, setQuantity] = React.useState<number>(1)
  const [notes, setNotes] = React.useState<string>("")

  const priceFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

  function toggleTopping(name: string) {
    setToppings((prev) => ({
      ...prev,
      [name]: { ...prev[name], selected: !prev[name].selected },
    }))
  }

  function handleAdd() {
    setOpen(false)
    onOrder()
    if (onAddToCart) {
      const toppingTotal = Object.values(toppings).reduce((sum, opt) => sum + (opt.selected ? opt.price : 0), 0)
      const totalPerItem = dish.price + toppingTotal
      const grandTotalNow = totalPerItem * quantity
      const selectedToppings = Object.entries(toppings)
        .filter(([, opt]) => opt.selected)
        .map(([name]) => name)
      onAddToCart({
        dishId: dish.id,
        name: dish.name,
        image: dish.image,
        description: dish.description,
        quantity,
        unitPrice: dish.price,
        toppingTotal,
        total: grandTotalNow,
        toppings: selectedToppings,
        isSpicy,
        notes,
      })
    }
  }

  const toppingTotal = React.useMemo(() => {
    return Object.values(toppings).reduce((sum, opt) => sum + (opt.selected ? opt.price : 0), 0)
  }, [toppings])
  const totalPerItem = dish.price + toppingTotal
  const grandTotal = totalPerItem * quantity

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={dish.image || "/placeholder.svg"}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-1 text-balance">{dish.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">{dish.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {dish.sold.toLocaleString("vi-VN")} đã bán · {dish.likes.toLocaleString("vi-VN")} lượt thích
            </div>
            <div className="text-lg font-semibold text-primary">{priceFormatter.format(dish.price)}</div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            onClick={() => setOpen(true)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-all cursor-pointer"
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Thêm món
          </Button>
        </CardFooter>


      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[100vh] overflow-y-auto w-full min-w-full sm:max-w-lg sm:min-w-0 p-0">
          <DialogHeader className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between gap-3 py-2 relative">
              <DialogTitle className="mx-auto text-base sm:text-lg">Thêm món mới</DialogTitle>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-accent transition"
              >
                ✕
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-5 px-6 pb-6">
            {/* Product Info */}
            <div className="flex items-center gap-4">
              <img
                src={dish.image || "/placeholder.svg"}
                alt={dish.name}
                className="w-20 h-20 rounded-md object-cover border"
              />
              <div className="min-w-0">
                <div className="text-base font-semibold text-foreground truncate">{dish.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{dish.description}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {dish.sold.toLocaleString("vi-VN")} đã bán · {dish.likes.toLocaleString("vi-VN")} lượt thích
                  </div>
                  <div className="text-lg font-semibold text-primary">{priceFormatter.format(dish.price)}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Mức độ cay</div>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${isSpicy === false ? "bg-accent" : "bg-background"}`}
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={isSpicy === false}
                    onChange={() => setIsSpicy(false)}
                  />
                  <span className="text-sm">Không cay</span>
                </label>
                <label
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${isSpicy === true ? "bg-accent" : "bg-background"}`}
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={isSpicy === true}
                    onChange={() => setIsSpicy(true)}
                  />
                  <span className="text-sm">Cay</span>
                </label>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Topping thêm</div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(toppings).map(([name, opt]) => (
                  <label
                    key={name}
                    className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 cursor-pointer ${opt.selected ? "bg-accent" : "bg-background"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={opt.selected}
                        onChange={() => toggleTopping(name)}
                      />
                      <span className="text-sm">{name}</span>
                    </div>
                    <span className="text-sm text-foreground/80">+ {priceFormatter.format(opt.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="text-sm font-medium mb-2">Số lượng</div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full cursor-pointer"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-full cursor-pointer"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Ít nước, thêm hành..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-6 pt-4 border-t">
            <Button onClick={handleAdd} className="rounded-full w-full">
              Thêm vào giỏ · {priceFormatter.format(grandTotal)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
