"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Menu, Pizza } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
// If your auth-client does not export signOut, use: authClient.signOut()
import { useSession, signOut } from "@/lib/auth-client"

// Colors
const COLORS = {
  cream: "#FFF8EC",
  ink: "#1F2A1F",
  green: "#2F6B3A",
  tomato: "#E8452C",
}

const activeStyle = { color: COLORS.green }
const idleStyle = { color: COLORS.ink }

const mobileUnderline =
  "underline decoration-[#E8452C] decoration-2 underline-offset-8"

// Animated underline
function Underline({ active }: { active: boolean }) {
  return (
    <span
      className={`absolute bottom-1 left-5 right-5 h-0.5 origin-left rounded-full transition-transform duration-300 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
      style={{ backgroundColor: COLORS.tomato }}
    />
  )
}

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
        className="text-base font-extrabold tracking-tight sm:text-lg"
        style={{ color: COLORS.ink }}
      >
        Pizza<span style={{ color: COLORS.tomato }}>Hub</span>
      </span>
    </Link>
  )
}

// Round avatar: shows the profile photo, or the first letter of the name
function Avatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }

  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
      style={{
        backgroundColor: "rgba(232,69,44,0.15)",
        color: COLORS.tomato,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [previousPathname, setPreviousPathname] = useState(pathname)

  // Reset menu state when the route changes, before rendering the new route.
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname)
    setOpen(false)
    setUserOpen(false)
  }

  // Ref lets us detect clicks outside the user dropdown so it can close
  const userRef = useRef<HTMLDivElement>(null)

  // Logged in user info
  const { data: session, isPending } = useSession()
  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role ?? "customer"
  const displayName = user?.name || user?.email || "User"
  const firstName = displayName.split(" ")[0]

  // Dashboard URL by role.
  // Each one must match a real folder under src/app/dashboard.
  const dashboardHref =
    role === "admin"
      ? "/dashboard"
      : role === "vendor"
        ? "/dashboard/vendor/overview"
        : "/dashboard/customer/overview"

  // One profile page for customers and vendors; it is frozen for admins
  const profileHref = "/dashboard/profile"
  const profileLocked = role === "admin"

  // Navigation links
  const links = [
    { label: "Home", href: "/" },
    { label: "Browse Menu", href: "/browse-menu" },
    ...(user ? [{ label: "Dashboard", href: dashboardHref }] : []),
  ]

  // Check active route
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)

    onScroll()

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false)
      }
    }

    window.addEventListener("resize", onResize)

    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Close the user dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserOpen(false)
      }
    }

    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  // Navigate and close menus
  const go = (href: string) => {
    setOpen(false)
    setUserOpen(false)
    router.push(href)
  }

  // Sign out, then go back to the home page
  const handleSignOut = async () => {
    setOpen(false)
    setUserOpen(false)
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className={`sticky top-0 z-50 mb-5 w-full px-3 transition-all duration-300 sm:px-4 ${
        scrolled ? "pt-2" : "pt-4"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-5xl items-center justify-between rounded-full border px-3 transition-all duration-300 sm:px-4 lg:px-6 ${
          scrolled ? "h-14 shadow-xl backdrop-blur" : "h-16 shadow-lg"
        }`}
        style={{
          backgroundColor: scrolled
            ? "rgba(255,248,236,0.92)"
            : COLORS.cream,
          borderColor: "rgba(31,42,31,0.1)",
        }}
      >
        {/* Logo */}
        <Logo />

        {/* Desktop navigation */}
        <ul
          className="hidden items-center gap-1 rounded-full p-1 lg:flex"
          style={{ backgroundColor: "rgba(47,107,58,0.08)" }}
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group relative block rounded-full px-5 py-2 text-sm font-semibold transition"
                style={isActive(link.href) ? activeStyle : idleStyle}
              >
                {link.label}
                <Underline active={isActive(link.href)} />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 1) Still checking the session: small placeholder so buttons don't flicker */}
          {isPending && (
            <div className="h-8 w-16 animate-pulse rounded-full bg-black/10 sm:w-24" />
          )}

          {/* 2) Logged in: avatar + dropdown (visible on every screen size) */}
          {!isPending && user && (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((value) => !value)}
                aria-expanded={userOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-black/5 sm:pr-3"
                style={{ color: COLORS.ink }}
              >
                <Avatar name={displayName} image={user.image} />

                <span className="hidden text-sm font-semibold md:inline">
                  {firstName}
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    userOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl border p-2 shadow-xl"
                  style={{
                    backgroundColor: COLORS.cream,
                    borderColor: "rgba(31,42,31,0.1)",
                    color: COLORS.ink,
                  }}
                >
                  {/* User info */}
                  <div className="px-3 pb-2 pt-2">
                    <p className="truncate text-sm font-bold">
                      {displayName}
                    </p>
                    <p className="truncate text-xs opacity-60">
                      {user.email} · {role}
                    </p>
                  </div>

                  <div className="my-1 border-t border-black/10" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => go(dashboardHref)}
                    className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[#2F6B3A]/10"
                  >
                    Dashboard
                  </button>

                  {/* Profile settings: frozen for admins */}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={profileLocked}
                    onClick={() => go(profileHref)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      profileLocked
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-[#2F6B3A]/10"
                    }`}
                  >
                    <span>Profile settings</span>
                    {profileLocked && (
                      <span className="text-[10px] font-bold text-[#E8452C]">
                        Locked
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[#E8452C]/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3) Logged out: desktop auth buttons */}
          {!isPending && !user && (
            <div className="hidden items-center gap-2 lg:flex">
              <Button
                variant="ghost"
                onClick={() => go("/sign-in")}
                className="rounded-full font-semibold hover:bg-black/5"
                style={{ color: COLORS.ink }}
              >
                Sign In
              </Button>

              <Button
                onClick={() => go("/sign-up")}
                className="rounded-full px-6 font-bold text-white hover:opacity-90"
                style={{ backgroundColor: COLORS.tomato }}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile and tablet menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 lg:hidden"
              style={{ color: COLORS.ink }}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>

            <SheetContent
              side="top"
              className="max-h-[90vh] overflow-y-auto rounded-b-3xl border-none"
              style={{
                backgroundColor: COLORS.cream,
                color: COLORS.ink,
              }}
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>

              <div className="mt-6 flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-full px-5 py-3 text-base font-semibold ${
                      isActive(link.href) ? mobileUnderline : ""
                    }`}
                    style={isActive(link.href) ? activeStyle : idleStyle}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Logged in: profile (frozen for admins) and sign out */}
                {!isPending && user && (
                  <>
                    <button
                      type="button"
                      disabled={profileLocked}
                      onClick={() => go(profileHref)}
                      className={`flex w-full items-center justify-between rounded-full px-5 py-3 text-left text-base font-semibold transition ${
                        profileLocked
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-[#2F6B3A]/10"
                      }`}
                      style={{ color: COLORS.ink }}
                    >
                      <span>Profile Settings</span>
                      {profileLocked && (
                        <span className="text-xs font-bold text-[#E8452C]">
                          Locked
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full rounded-full px-5 py-3 text-left text-base font-semibold transition hover:bg-[#E8452C]/10"
                      style={{ color: COLORS.tomato }}
                    >
                      Sign out
                    </button>
                  </>
                )}

                {/* Mobile auth buttons (only when logged out) */}
                {!isPending && !user && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => go("/sign-in")}
                      className="rounded-full font-semibold"
                      style={{
                        borderColor: COLORS.green,
                        color: COLORS.green,
                      }}
                    >
                      Sign In
                    </Button>

                    <Button
                      onClick={() => go("/sign-up")}
                      className="rounded-full font-bold text-white hover:opacity-90"
                      style={{ backgroundColor: COLORS.tomato }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}