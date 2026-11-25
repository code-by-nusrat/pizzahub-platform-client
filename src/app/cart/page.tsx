"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { useCart } from "@/lib/cart"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

export default function CartPage() {
  const { openCart, count, subtotal } = useCart()

  // The cart lives in a global drawer, so opening this route slides it in.
  useEffect(() => {
    openCart()
  }, [openCart])

  return (
    <>
      <Navbar />

      <main className="min-h-[60vh] bg-[#FFF8EC] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-xl border border-[#2B1B14]/10 bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
            <ShoppingBag className="h-6 w-6" />
          </span>

          <h1
            className={`${display.className} mt-4 text-3xl font-extrabold tracking-tight text-[#2B1B14]`}
          >
            Your cart
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#7A6258]">
            {count === 0
              ? "Your cart is empty. Add a dish from the menu and it will show up here."
              : `${count} ${count === 1 ? "item" : "items"} in your cart, subtotal ৳${subtotal.toFixed(2)}. The cart panel is open on the right.`}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/browse-menu"
              className="inline-flex h-11 items-center justify-center bg-[#2B1B14] px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              Browse menu
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-11 items-center justify-center border border-[#2B1B14]/20 px-6 text-sm font-semibold text-[#2B1B14] transition hover:border-[#E8452C] hover:text-[#E8452C]"
            >
              Open cart panel
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
