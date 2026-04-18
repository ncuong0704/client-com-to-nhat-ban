"use client"

import type React from "react"

import { useEffect, useMemo, useState, useActionState } from "react"
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
import type { Dish } from "@/components/menu-section.client"
import { contactFormAction } from "@/data/action"
import { StrapiImage } from "./StrapiImage"

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
  onClearCart?: () => void
}

export function OrderModal({ dish, open, onClose, cartCount = 0, cartTotal = 0, lastAdded, cartItems = [], onUpdateItem, onRemoveItem, onClearCart }: OrderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [successOpen, setSuccessOpen] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ cartCount: number; cartTotal: number } | null>(null)
  const [showAllItems, setShowAllItems] = useState(false)

  const initialFormState = useMemo(
    () => ({
      zodErrors: null as any,
      strapiErrors: null as any,
      errorMessage: null as string | null,
      successMessage: null as string | null,
    }),
    [],
  )
  const [state, formAction, isSubmitting] = useActionState(contactFormAction as any, initialFormState)

  // Build rich text JSON (order snapshot)
  const contentHtml = useMemo(() => {
    const th = (text: string) => `<th style="border:1px solid #e5e7eb;padding:8px;background:#f8fafc;text-align:left;font-weight:600;">${text}</th>`
    const td = (text: string) => `<td style="border:1px solid #e5e7eb;padding:8px;vertical-align:top;">${text}</td>`
    const currency = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
    const rows = (cartItems || []).map((it, idx) => {
      const toppings = (it.toppings && it.toppings.length) ? it.toppings.join(", ") : "—"
      const notes = it.notes && it.notes.trim() ? it.notes : "—"
      return `<tr>
        ${td(String(idx + 1))}
        ${td(it.name)}
        ${td(String(it.quantity))}
        ${td(currency(it.unitPrice))}
        ${td(currency(it.toppingTotal))}
        ${td(currency(it.total))}
        ${td(toppings)}
        ${td(notes)}
      </tr>`
    }).join("")
    const table = `
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;font-size:14px;">
        <thead>
          <tr>
            ${th("#")}
            ${th("Món")}
            ${th("SL")}
            ${th("Đơn giá")}
            ${th("Phụ phí")}
            ${th("Thành tiền")}
            ${th("Topping")}
            ${th("Ghi chú")}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="border:1px solid #e5e7eb;padding:8px;text-align:right;font-weight:600;">Tổng số món</td>
            <td style="border:1px solid #e5e7eb;padding:8px;font-weight:600;">${cartCount.toLocaleString("vi-VN")}</td>
            <td colspan="3" style="border:1px solid #e5e7eb;padding:8px;text-align:right;font-weight:600;">Tổng tiền: ${currency(cartTotal)}</td>
          </tr>
        </tfoot>
      </table>
    `
    return table
  }, [cartItems, cartCount, cartTotal])

  useEffect(() => {
    if (state && state.successMessage) {
      setSuccessInfo({ cartCount, cartTotal })
      setSuccessOpen(true)
      setFormData({ name: "", phone: "", address: "" })
      onClearCart && onClearCart()
      onClose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.successMessage])

  const priceFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })

  // Đã bỏ lựa chọn quận/phường và dịch vụ vận chuyển theo yêu cầu

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[600px] max-w-[100vw] max-h-[100vh] overflow-y-auto p-0"
      >
        <DialogHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b p-3">
          <div className="flex items-center justify-between gap-3 py-2">
            <DialogTitle className="text-2xl">Xác nhận đơn hàng</DialogTitle>
            <DialogClose className="rounded-md p-2 text-muted-foreground hover:bg-accent cursor-pointer" aria-label="Đóng">
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
                    <StrapiImage
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      type="thumbnail"
                      className="w-14 h-14 rounded-md object-cover border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{item.name}</div>
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
              <StrapiImage
                src={lastAdded.image}
                alt={lastAdded.name}
                width={64}
                height={64}
                type="thumbnail"
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
          <form action={formAction}>
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
                <input type="hidden" name="fullName" value={formData.name} />
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
                <input type="hidden" name="telephone" value={formData.phone} />
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
                <input type="hidden" name="address" value={formData.address} />
                <p className="text-xs font-medium text-green-600">
                  Miễn phí ship trong bán kính 5km. Ngoài bán kính, nhân viên sẽ báo phí ship khi xác nhận đơn.
                </p>
              </div>
              {/* Honeypot & timestamp */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <input type="hidden" name="timestamp" value={String(Date.now())} />
              {/* Rich text HTML table snapshot */}
              <input type="hidden" name="content" value={contentHtml} />
              
            </div>
            <DialogFooter className="sticky bottom-0 z-20 mb-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 border-t">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Đặt đơn"}
              </Button>
            </DialogFooter>
          </form>
          {state?.errorMessage && (
            <div className="px-3 pb-3 text-sm text-destructive">{state.errorMessage}</div>
          )}
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
          <div className="pt-1 text-xs text-muted-foreground">
            Miễn phí ship trong bán kính 5km. Ngoài bán kính, nhân viên sẽ báo phí ship khi xác nhận đơn.
          </div>
          <div className="pt-2">
            <span className="text-xs text-orange-500 font-semibold">Lưu ý để ý điện thoại</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setSuccessOpen(false)} className="rounded-full w-full cursor-pointer">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
