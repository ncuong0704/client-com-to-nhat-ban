"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Dish } from "@/components/menu-section"

interface OrderModalProps {
  dish: Dish | null
  open: boolean
  onClose: () => void
  cartCount?: number
  cartTotal?: number
  lastAdded?: {
    name: string
    image: string
    description: string
    quantity: number
    toppings: string[]
  } | null
  cartItems?: Array<{
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
  }>
  onUpdateItem?: (index: number, quantity: number) => void
  onRemoveItem?: (index: number) => void
}

export function OrderModal({ dish, open, onClose, cartCount = 0, cartTotal = 0, lastAdded, cartItems = [], onUpdateItem, onRemoveItem }: OrderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    ward: "",
    address: "",
    shippingProvider: "",
  })
  const [successOpen, setSuccessOpen] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ cartCount: number; cartTotal: number; shippingProvider?: string } | null>(null)
  const [showAllItems, setShowAllItems] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập submit thành công -> mở dialog thành công
    setSuccessInfo({ cartCount, cartTotal, shippingProvider: formData.shippingProvider || undefined })
    setSuccessOpen(true)
    setFormData({ name: "", phone: "", district: "", ward: "", address: "", shippingProvider: "" })
    onClose()
  }

  const priceFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

  // Minimal district/ward lists for HCMC demo; can be extended or fetched
  const districts = [
    "Quận 1",
    "Quận 3",
    "Quận 5",
    "Quận 7",
    "Quận 10",
    "Quận Bình Thạnh",
    "Quận Gò Vấp",
    "TP Thủ Đức",
  ]

  const wardsByDistrict: Record<string, string[]> = {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Ông Lãnh"],
    "Quận 3": ["Phường 6", "Phường 7", "Phường Võ Thị Sáu"],
    "Quận 5": ["Phường 1", "Phường 4", "Phường 6"],
    "Quận 7": ["Phú Mỹ", "Tân Phú", "Tân Quy"],
    "Quận 10": ["Phường 1", "Phường 5", "Phường 10"],
    "Quận Bình Thạnh": ["Phường 1", "Phường 5", "Phường 26"],
    "Quận Gò Vấp": ["Phường 3", "Phường 5", "Phường 10"],
    "TP Thủ Đức": ["Phường Linh Trung", "Phường Linh Tây", "Phường Hiệp Bình Chánh"],
  }

  const wards = formData.district ? wardsByDistrict[formData.district] || [] : []

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:min-w-0 sm:max-w-[600px] max-h-[100vh] overflow-y-auto p-0 min-w-full"
      >
        <DialogHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b p-3">
          <div className="flex items-center justify-between gap-3 py-2">
            <DialogTitle className="text-2xl">Xác nhận đơn hàng</DialogTitle>
            <DialogClose className="rounded-md p-2 text-muted-foreground hover:bg-accent" aria-label="Đóng">
              ✕
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="text-base p-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng số món</span>
            <span className="font-semibold">{cartCount.toLocaleString("vi-VN")} món</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng tiền</span>
            <span className="font-semibold text-primary">{priceFormatter.format(cartTotal)}</span>
          </div>
          {cartItems.length > 0 && (
            <div
              className="space-y-3 pr-1 mt-3"
            >
              <div className="order-cart-scrollbar">
                {(showAllItems ? cartItems : cartItems.slice(0, 1)).map((item, index) => (
                  <div key={`${item.dishId}-${index}`} className="border rounded-lg p-2 flex gap-3">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-14 h-14 rounded-md object-cover border" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate">{item.name}</div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {item.isSpicy !== null && (
                          <>
                            <span className="mx-2">·</span>
                            <span>{item.isSpicy ? "Cay" : "Không cay"}</span>
                          </>
                        )}
                        {item.toppings.length > 0 && (
                          <>
                            <span className="mx-2">·</span>
                            <span>Topping: {item.toppings.join(", ")}</span>
                          </>
                        )}
                        {item.notes && item.notes.trim() && (
                          <>
                            <span className="mx-2">·</span>
                            <span>Ghi chú: {item.notes}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          className="h-6 w-6 rounded-full border text-sm leading-none cursor-pointer"
                          onClick={() => onUpdateItem && onUpdateItem(index, Math.max(1, item.quantity - 1))}
                          aria-label="Giảm số lượng"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => onUpdateItem && onUpdateItem(index, Math.max(1, Number(e.target.value) || 1))}
                          className="h-6 w-10 text-xs text-center rounded-md border bg-background"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <button
                          type="button"
                          className="h-6 w-6 rounded-full border text-sm leading-none cursor-pointer"
                          onClick={() => onUpdateItem && onUpdateItem(index, item.quantity + 1)}
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="text-sm font-semibold text-primary">{priceFormatter.format(item.total)}</div>
                      <button
                        type="button"
                        className="text-xs text-destructive underline-offset-4 hover:underline"
                        onClick={() => onRemoveItem && onRemoveItem(index)}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
                {!showAllItems && cartItems.length > 1 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      className="text-sm text-primary underline underline-offset-4 cursor-pointer"
                      onClick={() => setShowAllItems(true)}
                    >
                      Xem thêm {cartItems.length - 1} món
                    </button>
                  </div>
                )}
                {showAllItems && cartItems.length > 1 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      className="text-sm text-primary underline underline-offset-4 cursor-pointer"
                      onClick={() => setShowAllItems(false)}
                    >
                      Thu gọn
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {lastAdded && (
            <div className="border rounded-lg p-3 mb-4 flex gap-3">
              <img
                src={lastAdded.image || "/placeholder.svg"}
                alt={lastAdded.name}
                className="w-16 h-16 rounded-md object-cover border"
              />
              <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">{lastAdded.name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{lastAdded.description}</div>
                <div className="text-sm mt-1">
                  Số lượng: <span className="font-medium">{lastAdded.quantity}</span>
                  {lastAdded.toppings.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      <span className="text-muted-foreground">Topping: {lastAdded.toppings.join(", ")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">
                  Họ và tên
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vui lòng nhập họ và tên"
                  required
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-base">
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Vui lòng nhập số điện thoại của bạn"
                  required
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district" className="text-base">Quận (TP. Hồ Chí Minh)</Label>
                <select
                  id="district"
                  className="h-11 rounded-md border bg-background px-3"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, ward: "" })}
                  required
                >
                  <option value="" disabled>Chọn quận</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ward" className="text-base">Phường</Label>
                <select
                  id="ward"
                  className="h-11 rounded-md border bg-background px-3"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  required
                  disabled={!formData.district}
                >
                  <option value="" disabled>{formData.district ? "Chọn phường" : "Chọn quận trước"}</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-base">
                  Địa chỉ (TP. Hồ Chí Minh)
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  required
                  rows={3}
                />
              </div>
              <div>
                <div className="text-base font-medium mb-2">Dịch vụ vận chuyển</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "grab", label: "Grab" },
                    { key: "xanhsm", label: "XanhSM" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer ${formData.shippingProvider === opt.key ? "bg-accent" : "bg-background"}`}
                    >
                      <input
                        type="radio"
                        name="shippingProvider"
                        className="accent-primary"
                        checked={formData.shippingProvider === opt.key}
                        onChange={() => setFormData({ ...formData, shippingProvider: opt.key })}
                        required
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 border-t">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full cursor-pointer"
              >
                Đặt đơn
              </Button>
            </DialogFooter>
          </form>
        </div>

      </DialogContent>
    </Dialog>

    {/* Success Dialog */}
    <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Đặt đơn thành công</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng số món</span>
            <span className="font-semibold">{(successInfo?.cartCount ?? 0).toLocaleString("vi-VN")} món</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng tiền</span>
            <span className="font-semibold text-primary">{priceFormatter.format(successInfo?.cartTotal ?? 0)}</span>
          </div>
          {successInfo?.shippingProvider && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vận chuyển</span>
              <span className="font-medium capitalize">{successInfo.shippingProvider}</span>
            </div>
          )}
          <div className="pt-2">
            <span className="text-xs text-orange-500 font-semibold">Lưu ý để ý điện thoại</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setSuccessOpen(false)} className="rounded-full w-full">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
