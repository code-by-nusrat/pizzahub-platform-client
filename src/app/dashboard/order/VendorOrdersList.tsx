"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  Check,
  ClipboardList,
  ImageOff,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  X,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"
import { decideOrder } from "@/lib/actions/vendor-order"


const display = Bricolage_Grotesque({ subsets: ["latin"] })

export type VendorOrder = {
  _id: string
  customer?: { name?: string; email?: string; phone?: string }
  items: {
    menuId: string
    name: string
    category?: string
    image?: string
    price: number
    quantity: number
    lineTotal?: number
  }[]
  delivery?: { address?: string; date?: string; note?: string }
  subtotal?: number
  status?: string
  createdAt?: string
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#FFF0E3] text-[#C2561B]",
  accepted: "bg-[#EAF4E8] text-[#3D8545]",
  rejected: "bg-[#FCE8E6] text-[#B3261E]",
  cancelled: "bg-[#2B1B14]/10 text-[#7A6258]",
}

const FILTERS = ["all", "pending", "accepted", "rejected", "cancelled"] as const

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

export default function VendorOrdersList({
  orders: initialOrders,
  businessName,
  errorMessage,
}: {
  orders: VendorOrder[]
  businessName: string
  errorMessage: string | null
}) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all")
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(orderId: string, status: "accepted" | "rejected") {
    if (busyId) return // one decision at a time, no double clicks
    setBusyId(orderId)
    setError(null)

    const result = await decideOrder(orderId, status)

    setBusyId(null)
    setRejectId(null)

    if (!result.success) {
      setError(result.message || "Could not update this order.")
      router.refresh() // show the latest status (the customer may have cancelled)
      return
    }

    setOrders((list) =>
      list.map((o) => (o._id === orderId ? { ...o, status } : o))
    )
    router.refresh()
  }

  const countOf = (s: string) =>
    s === "all" ? orders.length : orders.filter((o) => (o.status || "pending") === s).length

  const visible =
    filter === "all"
      ? orders
      : orders.filter((o) => (o.status || "pending") === filter)

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h1
          className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
        >
          Customer <span className="text-[#E8452C]">orders.</span>
        </h1>
        <p className="mt-2 text-sm text-[#7A6258]">
          {businessName
            ? `Orders for ${businessName}. Accept or reject new orders.`
            : "Orders placed from your menu."}
        </p>

        {(errorMessage || error) && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#E8452C] bg-white px-4 py-3 text-sm text-[#2B1B14]"
          >
            {error || errorMessage}
          </p>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                filter === f
                  ? "border-[#2B1B14] bg-[#2B1B14] text-white"
                  : "border-[#2B1B14]/15 bg-white text-[#7A6258] hover:border-[#E8452C]/50"
              }`}
            >
              {f} ({countOf(f)})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 border border-[#2B1B14]/10 bg-white py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-[#E8452C]/50" />
            <p className="mt-4 font-semibold text-[#2B1B14]">No orders here</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-5">
            {visible.map((order) => {
              const status = order.status || "pending"
              const pending = status === "pending"
              const busy = busyId === order._id
              const rejecting = rejectId === order._id

              return (
                <li key={order._id} className="border border-[#2B1B14]/10 bg-white">
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

                  <div className="grid gap-6 p-5 md:grid-cols-[1fr_1fr]">
                    {/* Items */}
                    <div>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8452C]">
                        Items
                      </p>
                      <ul className="space-y-3">
                        {order.items.map((item) => (
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
                              {item.category && (
                                <p className="text-xs text-[#7A6258]">{item.category}</p>
                              )}
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
                      <p className="mt-4 flex justify-between border-t border-dashed border-[#2B1B14]/20 pt-3 text-sm">
                        <span className="text-[#7A6258]">Items total</span>
                        <span
                          className={`${display.className} text-lg font-extrabold text-[#E8452C]`}
                        >
                          {money(order.subtotal)}
                        </span>
                      </p>
                    </div>

                    {/* Customer + delivery */}
                    <div className="space-y-5">
                      <div>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8452C]">
                          Customer
                        </p>
                        <ul className="space-y-1.5 text-sm text-[#2B1B14]">
                          <li className="flex items-center gap-2">
                            <User className="h-4 w-4 shrink-0 text-[#7A6258]" />
                            {order.customer?.name || "Customer"}
                          </li>
                          <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0 text-[#7A6258]" />
                            <span className="break-all">{order.customer?.email}</span>
                          </li>
                          {order.customer?.phone && (
                            <li className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-[#7A6258]" />
                              {order.customer.phone}
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8452C]">
                          Delivery
                        </p>
                        <ul className="space-y-1.5 text-sm text-[#2B1B14]">
                          <li className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[#7A6258]" />
                            {formatDeliveryDate(order.delivery?.date)}
                          </li>
                          <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7A6258]" />
                            {order.delivery?.address || "No address"}
                          </li>
                        </ul>
                      </div>

                      <div className="border-l-2 border-[#E8452C] bg-[#FFF8EC] px-4 py-3">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6258]">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Customer message
                        </p>
                        <p className="mt-1 text-sm text-[#2B1B14]">
                          {order.delivery?.note || "No message"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions: only pending orders, only once */}
                  {pending && (
                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#2B1B14]/10 px-5 py-3">
                      {rejecting ? (
                        <>
                          <span className="text-xs text-[#7A6258]">
                            Reject this order? This cannot be undone.
                          </span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(order._id, "rejected")}
                            className="bg-[#B3261E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#8E1D17] disabled:opacity-60"
                          >
                            {busy ? "Please wait..." : "Yes, reject"}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRejectId(null)}
                            aria-label="Keep order pending"
                            className="border border-[#2B1B14]/20 p-2 text-[#7A6258] transition hover:text-[#2B1B14]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRejectId(order._id)}
                            className="border border-[#B3261E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B3261E] transition hover:bg-[#B3261E] hover:text-white disabled:opacity-60"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(order._id, "accepted")}
                            className="inline-flex items-center gap-2 bg-[#3D8545] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2F6B3A] disabled:opacity-60"
                          >
                            <Check className="h-4 w-4" />
                            {busy ? "Please wait..." : "Accept"}
                          </button>
                        </>
                      )}
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