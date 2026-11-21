"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  ImageOff,
  MapPin,
  Store,
  X,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"
import { cancelOrder } from "@/lib/actions/cancel-order"


const display = Bricolage_Grotesque({ subsets: ["latin"] })

export type OrderItem = {
  menuId: string
  name: string
  category?: string
  image?: string
  price: number
  quantity: number
  businessName?: string
  lineTotal?: number
}

export type Order = {
  _id: string
  items: OrderItem[]
  delivery?: { address?: string; date?: string; note?: string }
  paymentMethod?: string
  subtotal?: number
  deliveryFee?: number
  discount?: number
  total?: number
  status?: string
  createdAt?: string
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#FFF0E3] text-[#C2561B]",
  accepted: "bg-[#EAF4E8] text-[#3D8545]",
  rejected: "bg-[#FCE8E6] text-[#B3261E]",
  cancelled: "bg-[#2B1B14]/10 text-[#7A6258]",
}

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  card: "Debit / Credit Card",
}

// "2026-11-25" -> "25 Nov 2026" (no timezone shifting)
function formatDeliveryDate(value?: string) {
  if (!value) return "Not selected"
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return value
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatRequestDate(value?: string) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  })
}

const money = (n?: number) => `৳${Number(n ?? 0).toFixed(2)}`

export default function OrdersList({
  orders: initialOrders,
  failed,
}: {
  orders: Order[]
  failed: boolean
}) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel(orderId: string) {
    setBusyId(orderId)
    setError(null)

    const result = await cancelOrder(orderId)

    setBusyId(null)
    setConfirmId(null)

    if (!result.success) {
      setError(result.message || "Could not cancel this order.")
      router.refresh() // the status may have changed, show the latest
      return
    }

    setOrders((list) =>
      list.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
    )
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <h1
          className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
        >
          My <span className="text-[#E8452C]">orders.</span>
        </h1>
        <p className="mt-2 text-sm text-[#7A6258]">
          Track your food orders. You can cancel an order while it is pending.
        </p>

        {(failed || error) && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#E8452C] bg-white px-4 py-3 text-sm text-[#2B1B14]"
          >
            {error || "We could not load your orders. Please try again."}
          </p>
        )}

        {orders.length === 0 && !failed ? (
          <div className="mt-10 border border-[#2B1B14]/10 bg-white py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-[#E8452C]/50" />
            <p className="mt-4 font-semibold text-[#2B1B14]">No orders yet</p>
            <Link
              href="/browse-menu"
              className="mt-3 inline-block text-sm font-bold text-[#E8452C] hover:underline"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-5">
            {orders.map((order) => {
              const status = order.status || "pending"
              const items = order.items ?? []
              const first = items[0]
              const extra = items.length - 1
              const vendors = [
                ...new Set(items.map((i) => i.businessName).filter(Boolean)),
              ].join(", ")
              const open = openId === order._id
              const confirming = confirmId === order._id
              const busy = busyId === order._id

              return (
                <li
                  key={order._id}
                  className="border border-[#2B1B14]/10 bg-white"
                >
                  {/* Top line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B1B14]/10 px-5 py-3 text-xs text-[#7A6258]">
                    <span>
                      Requested on{" "}
                      <span className="font-semibold text-[#2B1B14]">
                        {formatRequestDate(order.createdAt)}
                      </span>
                      <span className="mx-2">·</span>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>

                    <span
                      className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        STATUS_STYLE[status] ?? STATUS_STYLE.pending
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Main */}
                  <div className="flex gap-4 p-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden bg-[#FFF0E3] sm:h-28 sm:w-28">
                      {first?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={first.image}
                          alt={first.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#E8452C]">
                          <ImageOff size={24} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <h2
                        className={`${display.className} text-lg font-bold text-[#2B1B14]`}
                      >
                        {first?.name ?? "Order"}
                        {extra > 0 && (
                          <span className="ml-2 text-sm font-semibold text-[#7A6258]">
                            + {extra} more
                          </span>
                        )}
                      </h2>

                      <p className="flex items-center gap-2 text-sm text-[#7A6258]">
                        <Store className="h-4 w-4 shrink-0 text-[#E8452C]" />
                        <span className="truncate">{vendors || "Local kitchen"}</span>
                      </p>

                      <p className="flex items-center gap-2 text-sm text-[#7A6258]">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#E8452C]" />
                        Delivery: {formatDeliveryDate(order.delivery?.date)}
                      </p>

                      <p className="flex items-start gap-2 text-sm text-[#7A6258]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E8452C]" />
                        <span>{order.delivery?.address || "No address"}</span>
                      </p>
                    </div>

                    <p
                      className={`${display.className} hidden shrink-0 text-xl font-extrabold text-[#E8452C] sm:block`}
                    >
                      {money(order.total)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2B1B14]/10 px-5 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : order._id)}
                      aria-expanded={open}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2B1B14] transition hover:text-[#E8452C]"
                    >
                      {open ? "Hide details" : "View details"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Only pending orders can be cancelled */}
                    {status === "pending" &&
                      (confirming ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7A6258]">
                            Cancel this order?
                          </span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleCancel(order._id)}
                            className="bg-[#E8452C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B] disabled:opacity-60"
                          >
                            {busy ? "Cancelling..." : "Yes, cancel"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setConfirmId(null)}
                            aria-label="Keep order"
                            className="border border-[#2B1B14]/20 p-2 text-[#7A6258] transition hover:text-[#2B1B14]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(order._id)}
                          className="border border-[#E8452C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#E8452C] transition hover:bg-[#E8452C] hover:text-white"
                        >
                          Cancel order
                        </button>
                      ))}
                  </div>

                  {/* Details */}
                  {open && (
                    <div className="space-y-5 border-t border-[#2B1B14]/10 bg-[#FFF8EC] p-5">
                      <ul className="space-y-4">
                        {items.map((item) => (
                          <li key={item.menuId} className="flex gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden bg-[#FFF0E3]">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#E8452C]">
                                  <ImageOff size={18} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-[#2B1B14]">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#7A6258]">
                                {[item.category, item.businessName]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                              <p className="text-xs text-[#7A6258]">
                                {money(item.price)} × {item.quantity}
                              </p>
                            </div>

                            <p className="text-sm font-bold text-[#2B1B14]">
                              {money(item.lineTotal ?? item.price * item.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>

                      <dl className="space-y-2 border-t border-dashed border-[#2B1B14]/20 pt-4 text-sm">
                        <Row label="Subtotal" value={money(order.subtotal)} />
                        <Row label="Delivery fee" value={money(order.deliveryFee)} />
                        <Row label="Discount" value={`- ${money(order.discount)}`} />
                        <Row label="Total" value={money(order.total)} bold />
                        <Row
                          label="Payment"
                          value={
                            PAYMENT_LABEL[order.paymentMethod ?? ""] ??
                            order.paymentMethod ??
                            "-"
                          }
                        />
                        {order.delivery?.note && (
                          <Row label="Kitchen note" value={order.delivery.note} />
                        )}
                      </dl>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}

function Row({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#7A6258]">{label}</dt>
      <dd
        className={`text-right ${
          bold ? "font-extrabold text-[#E8452C]" : "font-semibold text-[#2B1B14]"
        }`}
      >
        {value}
      </dd>
    </div>
  )
}