
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pizza, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Colors
const COLORS = {
  cream: "#FFF8EC",
  ink: "#1F2A1F",
  green: "#2F6B3A",
  tomato: "#E8452C",
}

// Navigation links
const links = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
]

// Logo
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: COLORS.green }}
      >
        <Pizza className="h-5 w-5 text-white" />
      </span>

      <span
        className="text-lg font-extrabold tracking-tight"
        style={{ color: COLORS.ink }}
      >
        Pizza<span style={{ color: COLORS.tomato }}>Hub</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav
        className="mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border px-4 shadow-lg md:px-6"
        style={{
          backgroundColor: COLORS.cream,
          borderColor: "rgba(31,42,31,0.1)",
        }}
      >
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <ul
          className="hidden items-center gap-1 rounded-full p-1 md:flex"
          style={{ backgroundColor: "rgba(47,107,58,0.08)" }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-full px-5 py-2 text-sm font-semibold transition"
                  style={
                    isActive
                      ? {
                          backgroundColor: COLORS.green,
                          color: "white",
                        }
                      : { color: COLORS.ink }
                  }
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            className="rounded-full font-semibold hover:bg-black/5"
            style={{ color: COLORS.ink }}
          >
            Sign In
          </Button>

          <Button
            className="rounded-full px-6 font-bold text-white hover:opacity-90"
            style={{ backgroundColor: COLORS.tomato }}
          >
            Sign Up
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          {/* Fixed: No nested Button */}
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 md:hidden"
            style={{ color: COLORS.ink }}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>

          <SheetContent
            side="top"
            className="rounded-b-3xl border-none"
            style={{
              backgroundColor: COLORS.cream,
              color: COLORS.ink,
            }}
          >
            <SheetTitle className="sr-only">
              Navigation menu
            </SheetTitle>

            <div className="mt-6 flex flex-col gap-2">
              {/* Mobile Links */}
              {links.map((link) => {
                const isActive = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-full px-5 py-3 text-base font-semibold"
                    style={
                      isActive
                        ? {
                            backgroundColor: COLORS.green,
                            color: "white",
                          }
                        : { color: COLORS.ink }
                    }
                  >
                    {link.label}
                  </Link>
                )
              })}

              {/* Mobile Auth Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="rounded-full font-semibold"
                  style={{
                    borderColor: COLORS.green,
                    color: COLORS.green,
                  }}
                >
                  Sign In
                </Button>

                <Button
                  className="rounded-full font-bold text-white hover:opacity-90"
                  style={{ backgroundColor: COLORS.tomato }}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
