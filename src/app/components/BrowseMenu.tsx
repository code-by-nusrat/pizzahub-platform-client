"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ImageOff,
  MapPin,
  RefreshCw,
  Search,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { getMenu, type MenuItem } from "@/lib/vendor-menu-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "./Navbar"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const CATEGORIES = ["Pizza", "Burger", "Pasta", "Sides", "Dessert", "Drinks"]

type Filters = { name: string; category: string; location: string }
type Status = "loading" | "ready" | "error"

// "sides", "SIDES" and " Sides " all return "Sides". Anything else returns "".
const matchCategory = (text: string) =>
  CATEGORIES.find((c) => c.toLowerCase() === text.trim().toLowerCase()) ?? ""

export default function BrowseMenu({ initial }: { initial: Filters }) {
  // ---------- Filters ----------
  // What the visitor is typing (sent to the server when they submit the form)
  const [name, setName] = useState(initial.name)
  const [location, setLocation] = useState(initial.location)

  // What the server is actually filtering by.
  // If the visitor arrived with ?search=sides, "Sides" becomes the category
  // filter instead of a text search.
  const [applied, setApplied] = useState<Filters>(() => {
    const cat = matchCategory(initial.name)
    return cat ? { ...initial, name: "", category: cat } : initial
  })

  const hasFilters = Boolean(
    applied.name.trim() || applied.location.trim() || applied.category
  )

  // ---------- Data: fetched from GET /menu with the filters ----------
  const [items, setItems] = useState<MenuItem[]>([])
  const [status, setStatus] = useState<Status>("loading")
  const [fetching, setFetching] = useState(false)
  const [knownLocations, setKnownLocations] = useState<string[]>([])
  const requestId = useRef(0)

  const load = useCallback(
    async (filters: Filters, background = false) => {
      const id = ++requestId.current // ignore answers from older requests
      setFetching(true)
      try {
        const all = await getMenu({
          name: filters.name.trim(),
          category: filters.category,
          location: filters.location.trim(),
        })
        if (id !== requestId.current) return

        // const available = all.filter((item) => item.isAvailable)
        const available = all.filter((item) => item.isAvailable)
        setItems(available)
        setStatus("ready")

        // Remember every location we have seen, for the suggestions list
        setKnownLocations((prev) =>
          Array.from(
            new Set([...prev, ...available.map((i) => i.location)])
          ).filter(Boolean)
        )
      } catch (error) {
        console.error("Failed to load menu:", error)
        if (id !== requestId.current) return
        // A quiet background refresh should not replace the dishes with an error
        if (!background) setStatus("error")
      } finally {
        if (id === requestId.current) setFetching(false)
      }
    },
    []
  )

  // Fetch whenever the applied filters change (also runs once on mount)
  useEffect(() => {
    queueMicrotask(() => load(applied))
  }, [applied, load])

  // Refresh quietly when the visitor comes back to this tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        load(applied, true)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [applied, load])

  const router = useRouter()

  // Apply filters and keep the address bar in sync, e.g.
  // /browse-menu?search=pepperoni&category=Pizza&location=Banani
  function apply(next: Filters) {
    setApplied(next)

    const params = new URLSearchParams()
    if (next.name.trim()) params.set("search", next.name.trim())
    if (next.location.trim()) params.set("location", next.location.trim())
    if (next.category) params.set("category", next.category)

    const qs = params.toString()
    router.replace(qs ? `/browse-menu?${qs}` : "/browse-menu", {
      scroll: false,
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Typing a category name selects that category, like clicking its chip
    const cat = matchCategory(name)
    if (cat) {
      apply({ name: "", location, category: cat })
    } else {
      apply({ ...applied, name, location })
    }
  }

  // The cross in the search box removes what the box was filtering by:
  // the category (if the text was a category name) or the name search.
  function clearSearch() {
    const wasCategory = Boolean(matchCategory(name))
    setName("")
    apply({
      name: "",
      location,
      category: wasCategory ? "" : applied.category,
    })
  }

  // Chips work like radio buttons: one category at a time. Picking one
  // replaces a category that was typed into the search box.
  function selectCategory(value: string) {
    const typed = matchCategory(name) ? "" : name
    setName(typed)
    apply({ name: typed, location, category: value })
  }

  function clearAll() {
    setName("")
    setLocation("")
    apply({ name: "", location: "", category: "" })
  }

  function retry() {
    setStatus("loading")
    load(applied)
  }

  const locations = useMemo(() => knownLocations, [knownLocations])

  return (
    <div className="min-h-screen bg-[#FFF8EC] px-4 py-1 sm:px-8 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero */}
              <Navbar></Navbar>

        <header className="relative overflow-hidden bg-linear-to-r from-[#E8452C] to-[#F2751A] p-6 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-[#2B1B14]/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 text-xs font-medium text-white">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Fresh from local kitchens
            </span>

            <h1
              className={`${display.className} mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl`}
            >
              Find your next <span className="text-[#2B1B14]">favourite</span>{" "}
              dish.
            </h1>

            <p className="mt-4 max-w-md text-white/85">
              Search by name, location or category.
            </p>

            <form
              role="search"
              onSubmit={handleSubmit}
              className="mt-8 grid gap-3 sm:grid-cols-2"
            >
              {/* Search by name */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E8452C]" />
                <Input
                  type="search"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Search dishes by name..."
                  aria-label="Search dishes by name"
                  autoComplete="off"
                  className="h-12 rounded-none border-0 bg-white px-11 text-[#2B1B14] placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
                />
                {name && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8452C]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter by location */}
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#E8452C]" />
                <Input
                  type="text"
                  list="location-options"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location, e.g. Dhanmondi"
                  aria-label="Filter by location"
                  autoComplete="off"
                  className="h-12 rounded-none border-0 bg-white px-11 text-[#2B1B14] placeholder:text-gray-400"
                />
                <datalist id="location-options">
                  {locations.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
                {location && (
                  <button
                    type="button"
                    aria-label="Clear location"
                    onClick={() => setLocation("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8452C]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="h-12 rounded-none bg-[#2B1B14] text-white hover:bg-black sm:col-span-2"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </div>
        </header>

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...CATEGORIES].map((c) => {
            const value = c === "All" ? "" : c
            const selected = applied.category === value

            return (
              <button
                key={c}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCategory(value)}
                className={`px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8452C] ${
                  selected
                    ? "bg-[#E8452C] text-white shadow-md"
                    : "bg-white text-[#2B1B14] ring-1 ring-[#2B1B14]/10 hover:bg-[#FFE9CC] hover:text-[#E8452C]"
                }`}
              >
                {c}
              </button>
            )
          })}

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-[#7A6258] hover:bg-[#FFE9CC]"
            >
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Results */}
        {status === "loading" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#2B1B14]/10 bg-white">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 bg-[#FFF8EC] p-5">
                  <Skeleton className="mx-auto h-4 w-1/3" />
                  <Skeleton className="mx-auto h-6 w-2/3" />
                  <Skeleton className="mx-auto h-5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center bg-white p-16 text-center">
            <p className="text-red-500">
              Could not load menu items. Check that the server is running.
            </p>
            <Button
              onClick={retry}
              className="mt-5 rounded-none bg-[#E8452C] px-6 text-white hover:bg-[#C2331B]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div
            className={`flex flex-col items-center bg-white p-16 text-center transition-opacity ${
              fetching ? "opacity-60" : ""
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
              <UtensilsCrossed className="h-7 w-7" />
            </span>
            <h2
              className={`${display.className} mt-4 text-2xl font-extrabold text-[#2B1B14]`}
            >
              {hasFilters ? "No dishes found" : "No dishes available"}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[#7A6258]">
              {hasFilters
                ? "No available dishes match your search. Try different words or clear the filters."
                : "No dishes are available right now. Please check back soon."}
            </p>
            {hasFilters && (
              <Button
                onClick={clearAll}
                className="mt-5 rounded-none bg-[#E8452C] px-6 text-white hover:bg-[#C2331B]"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`space-y-8 transition-opacity ${
              fetching ? "opacity-60" : ""
            }`}
          >
            <p className="text-sm font-medium text-[#7A6258]" aria-live="polite">
              {items.length} {items.length === 1 ? "dish" : "dishes"}{" "}
              {hasFilters ? "found" : "available"}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <MenuCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MenuCard({ item }: { item: MenuItem }) {
  const [imgFailed, setImgFailed] = useState(false)
  const vendor = item.businessName || "Local kitchen"

  return (
    <article className="border border-[#2B1B14]/10 bg-white">
      {/* Photo */}
      <div className="relative aspect-4/3 overflow-hidden bg-white">
        {item.image && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#FFF1DD] text-[#E8452C]/40">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        <span className="absolute left-0 top-4 bg-[#2B1B14] px-3 py-1 text-xs font-semibold text-[#FFF8EC]">
          {item.category}
        </span>
      </div>

      {/* Footer */}
      <div className="bg-[#FFF8EC] px-5 pb-6 pt-5 text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm text-[#7A6258]">
          <Store className="h-3.5 w-3.5 text-[#E8452C]" />
          <span className="truncate">{vendor}</span>
        </p>

        <h2
          className={`${display.className} mt-1.5 text-lg font-extrabold text-[#2B1B14]`}
        >
          {item.name}
        </h2>

        {/* Diamond divider */}
        <div className="relative my-3 flex items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-[#2B1B14]/15" />
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF8EC]">
            <span className="h-2.5 w-2.5 rotate-45 bg-[#E8452C]" />
          </span>
        </div>

        <p className="text-xl font-bold text-[#E8452C]">
          ৳{Number(item.price).toFixed(2)}
        </p>

        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[#7A6258]">
          <MapPin className="h-3 w-3" />
          {item.location}
        </p>

        <Link
          href={`/browse-menu/${item._id}`}
          className="mt-4 flex h-10 w-full items-center justify-center bg-[#2B1B14] text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8452C]"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}