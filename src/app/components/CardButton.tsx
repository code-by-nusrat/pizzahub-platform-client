"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { useCart } from "../../lib/cart"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

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
    <div className="border border-[#2B1B14]/10 bg-white shadow-[0_20px_50px_-20px_rgba(43,27,20,0.35)]">
      {/* Price header */}
      <div className="flex items-end justify-between bg-[#2B1B14] px-6 py-5 text-[#FFF8EC]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#FFF8EC]/60">
            Price per dish
          </p>
          <p
            className={`${display.className} mt-0.5 text-3xl font-extrabold text-[#F2751A]`}
          >
            ৳{price.toFixed(2)}
          </p>
        </div>
        <span className="pb-1 text-xs text-[#FFF8EC]/60">
          Made fresh to order
        </span>
      </div>

      <div className="space-y-6 p-6">
        {/* Quantity */}
        <section>
          <h3 className="text-sm font-bold text-[#2B1B14]">How many?</h3>

          <div className="mt-3 flex items-center border border-[#2B1B14]/15">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-12 w-12 items-center justify-center text-[#2B1B14] transition-colors hover:bg-[#FFE9CC] disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span
              aria-live="polite"
              className={`${display.className} flex-1 text-center text-xl font-extrabold text-[#2B1B14]`}
            >
              {qty}
            </span>

            <button
              type="button"
              aria-label="Increase quantity"
              disabled={qty >= 20}
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              className="flex h-12 w-12 items-center justify-center text-[#2B1B14] transition-colors hover:bg-[#FFE9CC] disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Total + add to cart */}
        <div className="space-y-4 border-t border-dashed border-[#2B1B14]/20 pt-5">
          <div className="flex items-end justify-between">
            <span className="text-sm text-[#7A6258]">
              {qty} × ৳{price.toFixed(2)}
            </span>
            <span
              className={`${display.className} text-3xl font-extrabold text-[#2B1B14]`}
            >
              ৳{total.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!available}
            className="flex h-12 w-full items-center justify-center gap-2 bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B1B14] disabled:cursor-not-allowed disabled:bg-[#2B1B14]/15 disabled:text-[#2B1B14]/40"
          >
            <ShoppingBag className="h-4 w-4" />
            {available ? "Add to cart" : "Currently unavailable"}
          </button>
        </div>
      </div>
    </div>
  )
}