"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Dish } from "@/components/menu-section.client"
import { StrapiImage } from "./StrapiImage"

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
  const orderedGroups = React.useMemo(() => (dish.add ?? []), [dish])
  const radioGroups = React.useMemo(() => (dish.add ?? []).filter((a) => a.__component === "elements.add-radio-list"), [dish])
  const checkboxGroups = React.useMemo(() => (dish.add ?? []).filter((a) => a.__component === "elements.add-checkbox-list"), [dish])

  const [radioSelections, setRadioSelections] = React.useState<Record<number, { name: string; price: number | null }>>({})
  const [toppings, setToppings] = React.useState<Record<string, { selected: boolean; price: number }>>(() => {
    const initial: Record<string, { selected: boolean; price: number }> = {}
    for (const group of checkboxGroups) {
      for (const item of group.list) {
        if (!(item.name in initial)) initial[item.name] = { selected: false, price: item.price ?? 0 }
      }
    }
    return initial
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
      const radioTotal = Object.values(radioSelections).reduce((sum, sel) => sum + (sel.price ?? 0), 0)
      const totalPerItem = dish.price + toppingTotal + radioTotal
      const grandTotalNow = totalPerItem * quantity
      const selectedToppings = Object.entries(toppings)
        .filter(([, opt]) => opt.selected)
        .map(([name]) => name)
      const selectedRadios = Object.values(radioSelections).map(sel => sel.name)
      const combinedOptions = [...selectedToppings, ...selectedRadios]

      const spicyGroup = radioGroups.find((g: any) => /cay/i.test(g.title))
      const spicySel = spicyGroup ? radioSelections[spicyGroup.id] : undefined
      const isSpicy = spicySel ? (spicySel.name.toLowerCase().includes("cay") ? true : false) : null
      onAddToCart({
        dishId: dish.documentId,
        name: dish.name,
        image: typeof dish.image === 'string' ? dish.image : dish.image?.url || "/placeholder.svg",
        description: dish.description,
        quantity,
        unitPrice: dish.price,
        toppingTotal: toppingTotal + radioTotal,
        total: grandTotalNow,
        toppings: combinedOptions,
        isSpicy,
        notes,
      })
    }
    // Reset dialog state after add
    setRadioSelections({})
    setToppings((prev) => {
      const next: Record<string, { selected: boolean; price: number }> = {}
      for (const [name, opt] of Object.entries(prev)) {
        next[name] = { ...opt, selected: false }
      }
      return next
    })
    setQuantity(1)
    setNotes("")
  }

  const toppingTotal = React.useMemo(() => {
    return Object.values(toppings).reduce((sum, opt) => sum + (opt.selected ? opt.price : 0), 0)
  }, [toppings])
  const radioTotalPreview = React.useMemo(() => Object.values(radioSelections).reduce((sum, sel) => sum + (sel.price ?? 0), 0), [radioSelections])
  const totalPerItem = dish.price + toppingTotal + radioTotalPreview
  const grandTotal = totalPerItem * quantity

  // Badges theo dữ liệu (không suy luận)
  const badges = Array.isArray((dish as any)?.badges)
    ? ((dish as any).badges as Array<{ name: string, color: string }>)
    : []
  const isSoldOut = ((dish as any)?.soldOut === true) || badges.some(b => b.name === "Đã hết")

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
              {badges.map((b, index) => {
                return (
                  <span key={`${b.name}-${index}`} className="px-2 py-0.5 rounded text-[11px] font-medium shadow text-white" style={{ background: b.color }}>
                    {b.name}
                  </span>
                )
              })}
            </div>
          )}
          <StrapiImage
            src={typeof dish.image === 'string' ? dish.image : dish.image?.url || "/placeholder.svg"}
            alt={dish.name}
            width={640}
            height={480}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isSoldOut && <div className="absolute inset-0 bg-black/40" />}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1 rounded bg-gray-900/80 text-white text-sm font-semibold">Hết hàng</span>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-1 text-balance">{dish.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">{dish.description}</p>
          <div className="flex items-center justify-between ">
            <div className="text-sm text-muted-foreground flex flex-wrap">
              <span className="whitespace-nowrap">
                {dish?.sold?.toLocaleString("vi-VN") || 0} đã bán
              </span>
              <span className="mx-1">·</span>
              <span className="whitespace-nowrap">
                {dish?.likes?.toLocaleString("vi-VN") || 0} lượt thích
              </span>
            </div>
            <div className="text-lg font-semibold text-primary ml-2 whitespace-nowrap">{priceFormatter.format(dish.price)}</div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            onClick={() => setOpen(true)}
            disabled={isSoldOut}
            className={`w-full rounded-full transition-all ${isSoldOut ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"}`}
          >
            {!isSoldOut && <ShoppingCart className="mr-2 h-4 w-4" />}
            {isSoldOut ? "Hết hàng" : "Thêm món"}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-accent transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-5 px-6 pb-6">
            {/* Product Info */}
            <div className="flex items-center gap-4">
              <StrapiImage
                src={typeof dish.image === 'string' ? dish.image : dish.image?.url}
                alt={dish.image?.alternativeText || dish.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-md object-cover border"
              />
              <div className="w-full">
                <div className="text-base font-semibold text-foreground">{dish.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{dish.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-muted-foreground flex flex-wrap">
                    <span className="whitespace-nowrap">
                      {dish?.sold?.toLocaleString("vi-VN") || 0} đã bán
                    </span>
                    <span className="mx-1">·</span>
                    <span className="whitespace-nowrap">
                      {dish?.likes?.toLocaleString("vi-VN") || 0} lượt thích
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-primary ml-2 whitespace-nowrap">{priceFormatter.format(dish.price)}</div>
                </div>
              </div>
            </div>

            {orderedGroups.length > 0 && orderedGroups.map((group: any) => {
              if (group.__component === "elements.add-radio-list") {
                return (
                  <div key={`radio-${group.id}`}>
                    <div className="text-sm font-medium mb-2">{group.title}</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {group.list.map((item: any) => {
                        const checked = radioSelections[group.id]?.name === item.name
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 cursor-pointer ${checked ? "bg-accent" : "bg-background"}`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`radio-group-${group.id}`}
                                className="accent-primary"
                                checked={checked}
                                onChange={() => setRadioSelections(prev => ({ ...prev, [group.id]: { name: item.name, price: item.price } }))}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            {item.price != null && <span className="text-sm text-foreground/80">+ {priceFormatter.format(item.price)}</span>}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              if (group.__component === "elements.add-checkbox-list") {
                return (
                  <div key={`checkbox-${group.id}`}>
                    <div className="text-sm font-medium mb-2">{group.title}</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {group.list.map((item: any) => {
                        const opt = toppings[item.name] ?? { selected: false, price: item.price ?? 0 }
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 cursor-pointer ${opt.selected ? "bg-accent" : "bg-background"}`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="accent-primary"
                                checked={opt.selected}
                                onChange={() => toggleTopping(item.name)}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="text-sm text-foreground/80">+ {priceFormatter.format(opt.price)}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return null
            })}

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
            <Button onClick={handleAdd} className="rounded-full w-full cursor-pointer">
              Thêm vào giỏ · {priceFormatter.format(grandTotal)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
