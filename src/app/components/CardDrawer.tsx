
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Check,
  ClipboardList,
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { useCart } from "../../lib/cart"
import { useSession } from "@/lib/auth-client"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const field =
  "w-full rounded-none border border-[#2B1B14]/15 bg-[#FFF8EC] px-3 py-2.5 text-sm text-[#2B1B14] placeholder:text-[#7A6258]/60 focus:border-[#E8452C] focus:outline-2 focus:outline-offset-0 focus:outline-[#E8452C]/30"

type Panel = "none" | "note" | "delivery"
type Errors = { date?: string; address?: string }

export default function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    setCheckoutDetails,
  } = useCart()

  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  const [panel, setPanel] = useState<Panel>("none")
  const [note, setNote] = useState("")
  const [date, setDate] = useState("")
  const [address, setAddress] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState(false)

  const [today, setToday] = useState("")

  // Calculate today's date
  useEffect(() => {
    queueMicrotask(() => {
      const d = new Date()
      const pad = (n: number) => String(n).padStart(2, "0")

      setToday(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      )
    })
  }, [])

  // Close drawer using Escape and prevent background scrolling
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }

    document.addEventListener("keydown", onKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [isOpen, closeCart])

  function handleClose() {
    closeCart()
    setTimeout(() => setDone(false), 300)
  }

  function handleCheckout() {
    if (items.length === 0) return

    if (!user) {
      handleClose()
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`
      )
      return
    }

    const next: Errors = {}

    if (!date) {
      next.date = "Choose a delivery date."
    } else if (today && date < today) {
      next.date = "Date cannot be in the past."
    }

    if (address.trim().length < 5) {
      next.address = "Enter your delivery address."
    }

    setErrors(next)

    if (Object.keys(next).length > 0) {
      setPanel("delivery")
      return
    }

    // Save all checkout information before navigating
    setCheckoutDetails({
      date,
      address: address.trim(),
      note: note.trim(),
    })

    closeCart()
    router.push("/payment")
  }

  const showSuccess = done && items.length === 0
  const isEmpty = items.length === 0 && !showSuccess

  return (
    <>
      {/* Dimmed background */}
      <div
        aria-hidden
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ${
          isOpen
            ? "visible translate-x-0"
            : "invisible translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#2B1B14]/10 px-6 py-5">
          <h2
            className={`${display.className} text-2xl font-extrabold text-[#2B1B14]`}
          >
            Shopping cart
          </h2>

          <button
            type="button"
            aria-label="Close cart"
            onClick={handleClose}
            className="text-[#7A6258] transition-colors hover:text-[#E8452C]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {showSuccess && (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C] text-white">
                <Check className="h-7 w-7" />
              </span>

              <h3
                className={`${display.className} mt-4 text-2xl font-extrabold text-[#2B1B14]`}
              >
                Orders placed
              </h3>

              <p className="mt-2 text-sm text-[#7A6258]">
                The kitchens have your orders. You can follow them on your
                orders page.
              </p>

              <Link
                href="/my-orders"
                onClick={handleClose}
                className="mt-6 bg-[#E8452C] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
              >
                View my orders
              </Link>
            </div>
          )}

          {isEmpty && (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
                <ShoppingBag className="h-7 w-7" />
              </span>

              <h3
                className={`${display.className} mt-4 text-2xl font-extrabold text-[#2B1B14]`}
              >
                Your cart is empty
              </h3>

              <p className="mt-2 text-sm text-[#7A6258]">
                Add a dish from the menu and it will show up here.
              </p>

              <Link
                href="/browse-menu"
                onClick={handleClose}
                className="mt-6 bg-[#E8452C] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
              >
                Browse the menu
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <ul className="divide-y divide-[#2B1B14]/10">
              {items.map((item) => (
                <li
                  key={item.menuId}
                  className="relative flex gap-4 px-6 py-5"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#FFF1DD]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#E8452C]/40">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pr-8">
                    <h3
                      className={`${display.className} text-lg font-extrabold leading-snug text-[#2B1B14]`}
                    >
                      {item.name}
                    </h3>

                    {item.businessName && (
                      <p className="truncate text-xs text-[#7A6258]">
                        {item.businessName}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-[#7A6258]">
                      ৳{item.price.toFixed(2)}
                    </p>

                    <div className="mt-3 inline-flex items-center border border-[#2B1B14]/30">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          setQuantity(item.menuId, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-[#2B1B14] transition-colors hover:bg-[#FFE9CC] disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span
                        aria-live="polite"
                        className="flex h-8 w-10 items-center justify-center border-x border-[#2B1B14]/30 text-sm font-semibold text-[#2B1B14]"
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase ${item.name}`}
                        disabled={item.quantity >= 20}
                        onClick={() =>
                          setQuantity(item.menuId, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-[#2B1B14] transition-colors hover:bg-[#FFE9CC] disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.menuId)}
                    className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2B1B14] shadow-md ring-1 ring-[#2B1B14]/10 transition-colors hover:text-[#E8452C]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="max-h-[75dvh] shrink-0 overflow-y-auto border-t border-[#2B1B14]/10 bg-white px-6 pb-6 pt-4">
            {/* Note / delivery toggles */}
            <div className="grid grid-cols-2 gap-2">
              <PanelButton
                active={panel === "note"}
                onClick={() =>
                  setPanel(panel === "note" ? "none" : "note")
                }
                icon={<ClipboardList className="h-6 w-6" />}
                label="Add note"
              />

              <PanelButton
                active={panel === "delivery"}
                onClick={() =>
                  setPanel(panel === "delivery" ? "none" : "delivery")
                }
                icon={<Truck className="h-6 w-6" />}
                label="Delivery"
                alert={Boolean(errors.date || errors.address)}
              />
            </div>

            {/* Kitchen note */}
            {panel === "note" && (
              <textarea
                aria-label="Note for the kitchen"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Extra crispy, no onions..."
                className={`${field} mt-4 resize-none`}
              />
            )}

            {/* Delivery information */}
            {panel === "delivery" && (
              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="cart-date"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#7A6258]"
                  >
                    Delivery date
                  </label>

                  <input
                    id="cart-date"
                    type="date"
                    min={today || undefined}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-invalid={Boolean(errors.date)}
                    className={field}
                  />

                  {errors.date && (
                    <p className="mt-1 text-xs font-medium text-[#C2331B]">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="cart-address"
                    className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#7A6258]"
                  >
                    Delivery address
                  </label>

                  <input
                    id="cart-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, road, area"
                    autoComplete="street-address"
                    aria-invalid={Boolean(errors.address)}
                    className={field}
                  />

                  {errors.address && (
                    <p className="mt-1 text-xs font-medium text-[#C2331B]">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Subtotal */}
            <div className="mt-5 flex items-end justify-between border-t border-[#2B1B14]/10 pt-4">
              <span className="text-lg text-[#7A6258]">
                Subtotal
              </span>

              <span
                className={`${display.className} text-2xl font-extrabold text-[#2B1B14]`}
              >
                ৳{subtotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-2 text-sm text-[#7A6258]">
              Add your delivery details, then check out.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleCheckout}
                className="h-12 w-full bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B1B14]"
              >
                Check out
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="h-12 w-full border border-[#2B1B14] text-sm font-bold uppercase tracking-wider text-[#2B1B14] transition-colors hover:bg-[#2B1B14] hover:text-white"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function PanelButton({
  active,
  alert,
  onClick,
  icon,
  label,
}: {
  active: boolean
  alert?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
        active
          ? "text-[#E8452C]"
          : alert
            ? "text-[#C2331B]"
            : "text-[#2B1B14] hover:text-[#E8452C]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
