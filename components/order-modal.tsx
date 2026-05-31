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
import type { Dish, Branch } from "@/components/menu-section.client"
import { contactFormAction } from "@/data/action"
import { StrapiImage } from "./StrapiImage"
import { formatVND } from "@/lib/utils"

interface OrderModalProps {
  dish: Dish | null
  open: boolean
  onClose: () => void
  cartCount?: number
  cartTotal?: number
  qrImageUrl?: string | null
  bankTransferInfo?: string | null
  branches?: Branch[]
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

export function OrderModal({ dish, open, onClose, cartCount = 0, cartTotal = 0, lastAdded, cartItems = [], qrImageUrl, bankTransferInfo, branches = [], onUpdateItem, onRemoveItem, onClearCart }: OrderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  })
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery")
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod")
  const [successOpen, setSuccessOpen] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ cartCount: number; cartTotal: number; deliveryMethod: string; branchName?: string; address?: string } | null>(null)
  const [formTimestamp, setFormTimestamp] = useState(() => String(Date.now()))

  useEffect(() => {
    if (open) {
      setFormTimestamp(String(Date.now()))
    }
  }, [open])

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
    const paymentLabel = paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" : "Thanh toán khi nhận hàng (COD)"
    const deliveryLabel = deliveryMethod === "pickup"
      ? `Lấy tại quán${selectedBranch ? ` — ${selectedBranch.name}` : ""}`
      : "Giao tại nhà"
    const table = `
      <p style="margin:0 0 6px 0;font-size:14px;"><strong>Hình thức nhận hàng:</strong> ${deliveryLabel}</p>
      <p style="margin:0 0 8px 0;font-size:14px;"><strong>Phương thức thanh toán:</strong> ${paymentLabel}</p>
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
  }, [cartItems, cartCount, cartTotal, paymentMethod, deliveryMethod, selectedBranch])

  useEffect(() => {
    if (state && state.successMessage) {
      setSuccessInfo({
        cartCount,
        cartTotal,
        deliveryMethod,
        branchName: deliveryMethod === "pickup" ? selectedBranch?.name : undefined,
        address: deliveryMethod === "delivery" ? formData.address : undefined,
      })
      setSuccessOpen(true)
      setFormData({ name: "", phone: "", address: "", email: "" })
      setDeliveryMethod("delivery")
      setSelectedBranch(null)
      onClearCart && onClearCart()
      onClose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.successMessage])


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
            <span className="font-semibold text-primary">{formatVND(cartTotal)}</span>
          </div>
          {cartItems.length > 0 && (
            <div
              className="space-y-3 pr-1 mt-3"
            >
              <div className="order-cart-scrollbar space-y-2">
                {cartItems.map((item, index) => (
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
                      <div className="text-sm font-semibold text-primary">{formatVND(item.total)}</div>
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

              {/* Hình thức nhận hàng */}
              <div className="grid gap-3">
                <Label className="text-base">Hình thức nhận hàng</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setDeliveryMethod("delivery"); setSelectedBranch(null) }}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors cursor-pointer ${
                      deliveryMethod === "delivery"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">🛵</span>
                    <span>Nhận đơn tại nhà</span>
                    <span className="text-xs font-normal">Giao hàng tận nơi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors cursor-pointer ${
                      deliveryMethod === "pickup"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">🏪</span>
                    <span>Lấy đơn tại quán</span>
                    <span className="text-xs font-normal">Đến lấy trực tiếp</span>
                  </button>
                </div>
              </div>

              {/* Chọn chi nhánh (chỉ hiện khi pickup) */}
              {deliveryMethod === "pickup" && (
                <div className="grid gap-2">
                  <Label htmlFor="branch" className="text-base">
                    Chi nhánh <span className="text-destructive">*</span>
                  </Label>
                  {branches.length > 0 ? (
                    <select
                      id="branch"
                      value={selectedBranch?.id ?? ""}
                      onChange={(e) => {
                        const b = branches.find((b) => String(b.id) === e.target.value) ?? null
                        setSelectedBranch(b)
                      }}
                      className={`h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${state?.zodErrors?.branchName ? "border-destructive" : "border-input"}`}
                    >
                      <option value="">-- Chọn chi nhánh --</option>
                      {branches.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name}{b.address ? ` — ${b.address}` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-muted-foreground border rounded-md p-3">
                      Vui lòng liên hệ nhân viên để biết địa chỉ chi nhánh.
                    </p>
                  )}
                  {state?.zodErrors?.branchName && (
                    <p className="text-xs text-destructive">{state.zodErrors.branchName[0]}</p>
                  )}
                  {selectedBranch?.address && (
                    <p className="text-xs text-muted-foreground">📍 {selectedBranch.address}</p>
                  )}
                  {selectedBranch?.phone && (
                    <p className="text-xs text-muted-foreground">📞 {selectedBranch.phone}</p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vui lòng nhập họ và tên"
                  required
                  className={`h-11 ${state?.zodErrors?.fullName ? "border-destructive" : ""}`}
                />
                {state?.zodErrors?.fullName && (
                  <p className="text-xs text-destructive">{state.zodErrors.fullName[0]}</p>
                )}
                <input type="hidden" name="fullName" value={formData.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-base">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ví dụ: 0912345678"
                  required
                  className={`h-11 ${state?.zodErrors?.telephone ? "border-destructive" : ""}`}
                />
                {state?.zodErrors?.telephone && (
                  <p className="text-xs text-destructive">{state.zodErrors.telephone[0]}</p>
                )}
                <input type="hidden" name="telephone" value={formData.phone} />
              </div>

              {/* Địa chỉ — chỉ hiện khi delivery */}
              {deliveryMethod === "delivery" && (
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-base">
                    Địa chỉ giao hàng <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, tên đường, phường/quận..."
                    required
                    rows={3}
                    className={state?.zodErrors?.address ? "border-destructive" : ""}
                  />
                  {state?.zodErrors?.address && (
                    <p className="text-xs text-destructive">{state.zodErrors.address[0]}</p>
                  )}
                  <p className="text-xs font-medium text-green-600">
                    Miễn phí ship trong bán kính 5km. Ngoài bán kính, nhân viên sẽ báo phí ship khi xác nhận đơn.
                  </p>
                </div>
              )}

              {/* Email — không bắt buộc */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-base">
                  Email <span className="text-muted-foreground text-xs font-normal">(không bắt buộc)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className={`h-11 ${state?.zodErrors?.email ? "border-destructive" : ""}`}
                />
                {state?.zodErrors?.email && (
                  <p className="text-xs text-destructive">{state.zodErrors.email[0]}</p>
                )}
                <p className="text-xs text-muted-foreground">Nhập email để nhận xác nhận đơn hàng</p>
                <input type="hidden" name="email" value={formData.email} />
              </div>

              {/* Phương thức thanh toán */}
              <div className="grid gap-3">
                <Label className="text-base">Phương thức thanh toán</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">💵</span>
                    <span>Thanh toán khi nhận hàng</span>
                    <span className="text-xs font-normal">(COD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors cursor-pointer ${
                      paymentMethod === "bank_transfer"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">🏦</span>
                    <span>Chuyển khoản</span>
                    <span className="text-xs font-normal">ngân hàng</span>
                  </button>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="rounded-xl border bg-muted/40 p-4 flex flex-col items-center gap-3">
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="Mã QR chuyển khoản"
                        className="w-52 h-52 object-contain rounded-lg border bg-white"
                      />
                    ) : (
                      <div className="w-52 h-52 rounded-lg border bg-muted flex items-center justify-center text-sm text-muted-foreground">
                        Chưa có mã QR
                      </div>
                    )}
                    {bankTransferInfo && (
                      <pre className="w-full text-xs text-center whitespace-pre-wrap font-sans text-foreground">
                        {bankTransferInfo}
                      </pre>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      Vui lòng chuyển khoản trước khi đặt đơn. Nhân viên sẽ xác nhận sau khi nhận được thanh toán.
                    </p>
                  </div>
                )}
              </div>

              {/* Honeypot & timestamp */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <input type="hidden" name="timestamp" value={formTimestamp} />
              <input type="hidden" name="paymentMethod" value={paymentMethod} />
              <input type="hidden" name="deliveryMethod" value={deliveryMethod} />
              <input type="hidden" name="branchName" value={selectedBranch?.name ?? ""} />
              <input type="hidden" name="address" value={deliveryMethod === "delivery" ? formData.address : ""} />
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
          <DialogTitle className="text-xl">Đặt đơn thành công 🎉</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng số món</span>
            <span className="font-semibold">{(successInfo?.cartCount ?? 0).toLocaleString("vi-VN")} món</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tổng tiền</span>
            <span className="font-semibold text-primary">{formatVND(successInfo?.cartTotal ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hình thức</span>
            <span className="font-semibold">
              {successInfo?.deliveryMethod === "pickup"
                ? `🏪 Lấy tại quán${successInfo.branchName ? ` — ${successInfo.branchName}` : ""}`
                : "🛵 Giao tại nhà"}
            </span>
          </div>
          {successInfo?.deliveryMethod === "delivery" && successInfo.address && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground shrink-0">Địa chỉ</span>
              <span className="font-medium text-right">{successInfo.address}</span>
            </div>
          )}
          {successInfo?.deliveryMethod === "delivery" && (
            <div className="pt-1 text-xs text-muted-foreground">
              Miễn phí ship trong bán kính 5km. Ngoài bán kính, nhân viên sẽ báo phí ship khi xác nhận đơn.
            </div>
          )}
          <div className="pt-2">
            <span className="text-xs text-orange-500 font-semibold">Lưu ý để ý điện thoại để nhân viên liên hệ xác nhận</span>
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
