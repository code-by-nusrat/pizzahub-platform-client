"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Wallet,
  ShoppingBag,
  Ticket,
  Truck,
  ImageOff,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { useCart } from "@/lib/cart"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

type PaymentMethod = "cod" | "bkash" | "nagad" | "card"

const paymentMethods = [
  {
    id: "cod" as const,
    name: "Cash on Delivery",
    description: "Pay when your food arrives",
    icon: Truck,
    color: "bg-[#EAF4E8]",
    text: "text-[#3D8545]",
  },
  {
    id: "bkash" as const,
    name: "bKash",
    description: "Pay securely with bKash",
    icon: Smartphone,
    color: "bg-[#FCE8EF]",
    text: "text-[#D82D69]",
  },
  {
    id: "nagad" as const,
    name: "Nagad",
    description: "Fast mobile payment",
    icon: Wallet,
    color: "bg-[#FFF0E3]",
    text: "text-[#E87527]",
  },
  {
    id: "card" as const,
    name: "Debit / Credit Card",
    description: "Visa, Mastercard and more",
    icon: CreditCard,
    color: "bg-[#E9EEFF]",
    text: "text-[#5068B5]",
  },
]

const methodNotes: Record<PaymentMethod, string> = {
  cod: "No advance payment required. Simply pay the delivery person when your order arrives.",
  bkash: "You selected bKash. Your order will be confirmed right away.",
  nagad: "You selected Nagad. Your order will be confirmed right away.",
  card: "You selected card payment. Your order will be confirmed right away.",
}

type Customer = { id?: string; name?: string; email: string }

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const PaymentPage = ({ customer }: { customer: Customer }) => {
  const router = useRouter()
  const {
    items,
    subtotal,
    checkoutDetails,
    clear,
  } = useCart()

  const [method, setMethod] = useState<PaymentMethod>("cod")
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [toastError, setToastError] = useState(false)

  // Demo delivery fee and discount
  const deliveryFee = 60
  const discount = 50
  const total = subtotal + deliveryFee - discount

  // Hide success toast after 4 seconds
  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => setToast(null), 4000)

    return () => clearTimeout(timer)
  }, [toast])

  // Save the order (and who ordered it) in the backend
  const handlePayment = async () => {
    if (loading || confirmed || items.length === 0) return

    setLoading(true)

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: items.map((i) => ({
            menuId: i.menuId,
            quantity: i.quantity,
          })),
          delivery: {
            address: checkoutDetails?.address,
            date: checkoutDetails?.date,
            note: checkoutDetails?.note,
          },
          paymentMethod: method,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        setToastError(true)
        setToast(data?.message || "Could not place your order. Please try again.")
        return
      }

      setConfirmed(true)
      setToastError(false)
      setToast("Order confirmed! Thank you for ordering with PizzaHub.")
      clear()

      // Show the success message for a moment, then go to the homepage
      setTimeout(() => router.push("/"), 2000)
    } catch {
      setToastError(true)
      setToast("Could not reach the server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">

      {/* Success toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 border bg-white p-4 shadow-xl sm:right-8 sm:top-8 ${
            toastError ? "border-[#E8452C]/40" : "border-[#3D8545]/30"
          }`}
        >
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
              toastError ? "bg-[#E8452C]" : "bg-[#3D8545]"
            }`}>
            {toastError ? <X size={16} /> : <Check size={16} />}
          </span>

          <p className="flex-1 pt-1 text-sm font-semibold text-[#2B1B14]">
            {toast}
          </p>

          <button
            type="button"
            aria-label="Close message"
            onClick={() => setToast(null)}
            className="pt-1 text-[#7A6258] transition hover:text-[#E8452C]"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <Link
              href="/browse-menu"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7A6258] transition hover:text-[#E8452C]"
            >
              <ArrowLeft size={16} />
              Back to menu
            </Link>

            <h1
              className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
            >
              Almost <span className="text-[#E8452C]">yours.</span>
            </h1>

            <p className="mt-2 text-sm text-[#7A6258]">
              One last step before your food adventure begins.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#2B1B14]/10 bg-white px-4 py-2.5">
            <LockKeyhole size={15} className="text-[#3D8545]" />
            <span className="text-xs font-semibold text-[#2B1B14]">
              Secure Checkout
            </span>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="mb-10 flex max-w-md items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8452C] text-white">
              <Check size={15} />
            </span>
            <span className="text-xs font-bold text-[#2B1B14]">
              Order
            </span>
          </div>

          <div className="h-px flex-1 bg-[#E8452C]/40" />

          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B1B14] text-white">
              2
            </span>
            <span className="text-xs font-bold text-[#2B1B14]">
              Payment
            </span>
          </div>

          <div className="h-px flex-1 bg-[#2B1B14]/15" />

          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
              confirmed
                ? "bg-[#3D8545] text-white"
                : "bg-[#2B1B14]/10 text-[#7A6258]"
            }`}>
              {confirmed ? <Check size={15} /> : "3"}
            </span>
            <span className={`text-xs font-bold ${
              confirmed ? "text-[#3D8545]" : "text-[#7A6258]"
            }`}>
              Done
            </span>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_390px]">

          {/* Left Side */}
          <div className="space-y-7">

            {/* Delivery Details */}
            <section className="border border-[#2B1B14]/10 bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#FFF0E3] text-[#E8452C]">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className={`${display.className} text-lg font-bold text-[#2B1B14]`}>
                      Delivery destination
                    </h2>
                    <p className="text-xs text-[#7A6258]">
                      Your food will arrive here
                    </p>
                  </div>
                </div>

                <Link
                  href="/browse-menu"
                  className="text-xs font-bold text-[#E8452C] hover:underline"
                >
                  Back
                </Link>
              </div>

              <div className="flex gap-3 border-l-2 border-[#E8452C] bg-[#FFF8EC] p-4">
                <Truck size={19} className="mt-0.5 shrink-0 text-[#E8452C]" />

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#2B1B14]">
                    Home Delivery
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#7A6258]">
                    {checkoutDetails?.address ||
                      "No delivery address provided"}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-[#2B1B14]">
                    Delivery date: {checkoutDetails?.date || "Not selected"}
                  </p>

                  {checkoutDetails?.note && (
                    <p className="mt-2 text-xs leading-5 text-[#7A6258]">
                      <span className="font-bold text-[#2B1B14]">
                        Kitchen note:
                      </span>{" "}
                      {checkoutDetails.note}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Actual Cart Products */}
            <section className="border border-[#2B1B14]/10 bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-[#FFF0E3] text-[#E8452C]">
                  <ShoppingBag size={21} />
                </div>

                <div>
                  <h2 className={`${display.className} text-lg font-bold text-[#2B1B14]`}>
                    Your delicious picks
                  </h2>

                  <p className="text-xs text-[#7A6258]">
                    {items.length} different{" "}
                    {items.length === 1 ? "item" : "items"} in your cart
                  </p>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex gap-4 border-b border-[#2B1B14]/10 pb-5 last:border-0 last:pb-0"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden bg-[#FFF0E3] sm:h-28 sm:w-28">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#E8452C]">
                            <ImageOff size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8452C]">
                            {item.businessName || "Food item"}
                          </span>

                          <h3 className={`${display.className} mt-1 text-lg font-bold text-[#2B1B14]`}>
                            {item.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#7A6258]">
                            ৳{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#7A6258]">
                            Qty: {item.quantity}
                          </span>

                          <span className="font-bold text-[#2B1B14]">
                            ৳{(
                              item.price * item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ShoppingBag
                    size={30}
                    className="mx-auto text-[#E8452C]/50"
                  />
                  <p className="mt-3 text-sm font-semibold text-[#2B1B14]">
                    Your cart is empty
                  </p>
                  <Link
                    href="/browse-menu"
                    className="mt-3 inline-block text-sm font-bold text-[#E8452C] hover:underline"
                  >
                    Browse menu
                  </Link>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="border border-[#2B1B14]/10 bg-white p-5 sm:p-7">
              <div className="mb-6">
                <h2 className={`${display.className} text-xl font-extrabold text-[#2B1B14]`}>
                  How would you like to pay?
                </h2>

                <p className="mt-1 text-sm text-[#7A6258]">
                  Choose your preferred payment method.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((item) => {
                  const Icon = item.icon
                  const selected = method === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={confirmed}
                      onClick={() => setMethod(item.id)}
                      className={`relative flex items-center gap-3 border p-4 text-left transition-all ${
                        selected
                          ? "border-[#E8452C] bg-[#FFF8EC] ring-1 ring-[#E8452C]"
                          : "border-[#2B1B14]/10 hover:border-[#E8452C]/50"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center ${item.color} ${item.text}`}>
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#2B1B14]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[11px] text-[#7A6258]">
                          {item.description}
                        </p>
                      </div>

                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#E8452C] bg-[#E8452C] text-white"
                          : "border-[#2B1B14]/20"
                      }`}>
                        {selected && <Check size={12} />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Selected payment information */}
              <div className="mt-5 flex gap-3 bg-[#EAF4E8] p-4">
                <PackageCheck
                  className="mt-0.5 shrink-0 text-[#3D8545]"
                  size={19}
                />

                <p className="text-xs leading-5 text-[#386C3E]">
                  {methodNotes[method]}
                </p>
              </div>

              <p className="mt-3 text-[11px] text-[#7A6258]">
                No payment details are verified. Choosing a method is enough.
              </p>
            </section>
          </div>

          {/* Right Side - Summary */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden border border-[#2B1B14]/10 bg-white">
              <div className="bg-[#2B1B14] p-6 text-white">
                <div className="flex items-center gap-2 text-[#F2751A]">
                  <Ticket size={19} />

                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    The final bill
                  </span>
                </div>

                <p className={`${display.className} mt-5 text-4xl font-extrabold`}>
                  ৳{total.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-white/55">
                  Your total payable amount
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6258]">
                    Subtotal ({totalItems} items)
                  </span>

                  <span className="font-semibold text-[#2B1B14]">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#7A6258]">
                    Delivery fee
                  </span>

                  <span className="font-semibold text-[#2B1B14]">
                    ৳{deliveryFee.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-[#3D8545]">
                    <Ticket size={14} />
                    Discount
                  </span>

                  <span className="font-semibold text-[#3D8545]">
                    - ৳{discount.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-dashed border-[#2B1B14]/20 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#2B1B14]">
                      Total payable
                    </span>

                    <span className={`${display.className} text-xl font-extrabold text-[#E8452C]`}>
                      ৳{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    confirmed ||
                    items.length === 0
                  }
                  className="group flex h-13 w-full items-center justify-center gap-3 bg-[#E8452C] px-5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : confirmed
                      ? "Order confirmed"
                      : "Confirm order"}

                  {!loading && !confirmed && (
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}

                  {confirmed && <Check size={18} />}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2 text-center text-[10px] text-[#7A6258]">
                  <ShieldCheck
                    size={15}
                    className="text-[#3D8545]"
                  />
                  Your checkout is protected
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 border border-[#2B1B14]/10 bg-[#FFF1DD] p-4">
              <LockKeyhole
                size={17}
                className="mt-0.5 shrink-0 text-[#E8452C]"
              />

              <p className="text-xs leading-5 text-[#7A6258]">
                Your personal information is used only to process and deliver
                your order.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-[#2B1B14]/10 pt-6 text-center">
          <p className={`${display.className} text-sm font-bold text-[#2B1B14]`}>
            Good food. Good mood.{" "}
            <span className="text-[#E8452C]">PizzaHub.</span>
          </p>

          <p className="mt-1 text-[10px] text-[#7A6258]">
            Thank you for choosing local food businesses.
          </p>
        </div>
      </div>
    </main>
  )
}

export default PaymentPage