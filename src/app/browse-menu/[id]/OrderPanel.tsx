"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Fraunces } from "next/font/google"

import { useCart } from "@/lib/cart"

const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"] })

export default function OrderPanel({
  menuId,
  name,
  price,
  image,
  businessName,
  available,
}: {
  menuId: string
  name: string
  price: number
  image?: string
  businessName?: string
  available: boolean
}) {
  const { addItem, openCart } = useCart()
  const [qty, setQty] = useState(1)

  const total = price * qty

  function handleAddToCart() {
    addItem({ menuId, name, price, image, businessName }, qty)
    setQty(1)
    openCart() // slides the cart in from the right
  }

  return (
    // Double frame, like the border of a printed menu card
    <div className="border border-green-900/35 bg-white p-6 outline outline-1 outline-offset-[6px] outline-green-900/20 sm:p-7">
      <h2
        className={`${serif.className} text-2xl font-semibold italic text-green-900`}
      >
        Order this dish
      </h2>

      <div className="mt-5 space-y-4">
        <Row label="Price per dish" value={`৳${price.toFixed(2)}`} />

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
            Quantity
          </span>
          <span
            aria-hidden
            className="flex-1 border-b-2 border-dotted border-green-900/30"
          />
          <div className="inline-flex items-center border border-green-900/35">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center text-green-900 transition-colors hover:bg-green-900/10 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              aria-live="polite"
              className={`${serif.className} flex h-10 w-11 items-center justify-center border-x border-green-900/35 text-lg font-semibold text-green-900`}
            >
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={qty >= 20}
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="flex h-10 w-10 items-center justify-center text-green-900 transition-colors hover:bg-green-900/10 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Row label="Total" value={`৳${total.toFixed(2)}`} big />
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!available}
        className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 disabled:cursor-not-allowed disabled:bg-green-900/15 disabled:text-green-900/50"
      >
        <ShoppingBag className="h-4 w-4" />
        {available ? "Add to cart" : "Currently unavailable"}
      </button>

      <p className="mt-3 text-center text-xs text-green-700">
        You add your delivery date and address in the cart.
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  big,
}: {
  label: string
  value: string
  big?: boolean
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
        {label}
      </span>
      <span
        aria-hidden
        className="flex-1 translate-y-[-3px] border-b-2 border-dotted border-green-900/30"
      />
      <span
        className={`${serif.className} font-semibold text-green-900 ${
          big ? "text-3xl" : "text-lg"
        }`}
      >
        {value}
      </span>
    </div>
  )
}