import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  ClipboardList,
  Receipt,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { getSession } from "@/lib/core/server"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type AdminStats = {
  totalUsers?: number
  totalVendors?: number
  totalCustomers?: number
  totalMenuItems?: number
  pendingMenuItems?: number
  totalTransactions?: number
}

type Stat = {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: string
  href: string
}

async function getStats(email: string): Promise<AdminStats | null> {
  try {
    const res = await fetch(
      `${API}/admin/stats?email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    return (await res.json()) as AdminStats
  } catch {
    return null
  }
}

const AdminOverviewPage = async () => {
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const role = (session.user as { role?: string }).role
  if (role !== "admin") redirect("/unauthorized")

  const stats = await getStats(session.user.email)

  const tiles: Stat[] = [
    {
      label: "Registered users",
      value: stats?.totalUsers ?? 0,
      hint: "Everyone with a PizzaHub account",
      icon: Users,
      tone: "bg-[#2B1B14]/10 text-[#2B1B14]",
      href: "/dashboard/admin/manage-users",
    },
    {
      label: "Vendors",
      value: stats?.totalVendors ?? 0,
      hint: "Kitchens selling on PizzaHub",
      icon: Store,
      tone: "bg-[#FFF0E3] text-[#C2561B]",
      href: "/dashboard/admin/manage-users",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      hint: "Accounts that can place orders",
      icon: ShoppingBag,
      tone: "bg-[#EAF4E8] text-[#3D8545]",
      href: "/dashboard/admin/manage-users",
    },
    {
      label: "Menu items",
      value: stats?.totalMenuItems ?? 0,
      hint: "Submitted by every vendor",
      icon: UtensilsCrossed,
      tone: "bg-[#E9EEFF] text-[#5068B5]",
      href: "/dashboard/admin/manage-items",
    },
    {
      label: "Pending review",
      value: stats?.pendingMenuItems ?? 0,
      hint: "Waiting for an approval decision",
      icon: ClipboardList,
      tone: "bg-[#FFF0E3] text-[#C2561B]",
      href: "/dashboard/admin/manage-items",
    },
    {
      label: "Transactions",
      value: stats?.totalTransactions ?? 0,
      hint: "Verified Stripe payments",
      icon: Receipt,
      tone: "bg-[#FCE8E6] text-[#B3261E]",
      href: "/dashboard/admin/transactions",
    },
  ]

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h1
          className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
        >
          PizzaHub <span className="text-[#E8452C]">administration.</span>
        </h1>
        <p className="mt-2 text-sm text-[#7A6258]">
          Accounts, menu approvals and payments in one place.
        </p>

        {!stats && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#E8452C] bg-white px-4 py-3 text-sm text-[#2B1B14]"
          >
            We could not load the latest statistics. The numbers below may be
            out of date.
          </p>
        )}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <li key={tile.label}>
              <Link
                href={tile.href}
                className="group block h-full border border-[#2B1B14]/10 bg-white p-5 transition hover:border-[#E8452C]/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6258]">
                    {tile.label}
                  </p>
                  <span
                    className={`flex h-9 w-9 items-center justify-center ${tile.tone}`}
                  >
                    <tile.icon className="h-4 w-4" />
                  </span>
                </div>

                <p
                  className={`${display.className} mt-4 text-4xl font-extrabold text-[#2B1B14]`}
                >
                  {tile.value}
                </p>
                <p className="mt-1 text-xs text-[#7A6258]">{tile.hint}</p>

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#E8452C] opacity-0 transition group-hover:opacity-100">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/admin/manage-users"
            className="inline-flex items-center gap-2 bg-[#E8452C] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B]"
          >
            Manage users
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/admin/manage-items"
            className="inline-flex items-center gap-2 border border-[#2B1B14]/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#2B1B14] transition hover:bg-white"
          >
            Review menu items
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/admin/transactions"
            className="text-sm font-bold text-[#2B1B14] transition hover:text-[#E8452C]"
          >
            View transactions
          </Link>
        </div>
      </div>
    </main>
  )
}

export default AdminOverviewPage
