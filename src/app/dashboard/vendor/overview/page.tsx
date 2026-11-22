import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { getSession } from "@/lib/core/server"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type MenuLite = {
  isAvailable?: boolean
  approvalStatus?: string
}

type OrderLite = {
  status?: string
}

type Plan = {
  premium?: boolean
  plan?: string
  activeItemLimit?: number | null
}

type Stat = {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: string
}

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

const VendorOverviewPage = async () => {
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const email = session.user.email

  const profile = await safeJson<{ businessName?: string }>(
    `${API}/vendor-profile/${encodeURIComponent(email)}`
  )

  const businessName = profile?.businessName ?? ""

  const [menu, orderResult, plan] = await Promise.all([
    businessName
      ? safeJson<MenuLite[]>(
          `${API}/menu?approvalStatus=all&businessName=${encodeURIComponent(
            businessName
          )}`
        )
      : Promise.resolve([] as MenuLite[]),
    safeJson<{ orders?: OrderLite[] }>(
      `${API}/vendor/orders?email=${encodeURIComponent(email)}`
    ),
    safeJson<Plan>(`${API}/subscription/${encodeURIComponent(email)}`),
  ])

  const items = Array.isArray(menu) ? menu : []
  const orders = orderResult?.orders ?? []

  const countOrders = (status: string) =>
    orders.filter((order) => (order.status || "pending") === status).length

  const activeItems = items.filter((item) => item.isAvailable).length
  const premium = Boolean(plan?.premium)

  const stats: Stat[] = [
    {
      label: "Total menu items",
      value: items.length,
      hint: `${activeItems} published right now`,
      icon: UtensilsCrossed,
      tone: "bg-[#2B1B14]/10 text-[#2B1B14]",
    },
    {
      label: "Active menu items",
      value: activeItems,
      hint: premium
        ? "Unlimited with Premium"
        : `${activeItems} of ${plan?.activeItemLimit ?? 3} free items used`,
      icon: Sparkles,
      tone: "bg-[#FFF0E3] text-[#C2561B]",
    },
    {
      label: "Pending orders",
      value: countOrders("pending"),
      hint: "Waiting for your decision",
      icon: Clock,
      tone: "bg-[#FFF0E3] text-[#C2561B]",
    },
    {
      label: "Accepted orders",
      value: countOrders("accepted"),
      hint: "Confirmed with the customer",
      icon: CheckCircle2,
      tone: "bg-[#EAF4E8] text-[#3D8545]",
    },
  ]

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h1
          className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
        >
          {businessName ? businessName : "Your kitchen"}
          <span className="text-[#E8452C]"> overview.</span>
        </h1>
        <p className="mt-2 text-sm text-[#7A6258]">
          Your menu, customer orders and subscription at a glance.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="border border-[#2B1B14]/10 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6258]">
                  {stat.label}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center ${stat.tone}`}
                >
                  <stat.icon className="h-4 w-4" />
                </span>
              </div>

              <p
                className={`${display.className} mt-4 text-4xl font-extrabold text-[#2B1B14]`}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-[#7A6258]">{stat.hint}</p>
            </li>
          ))}
        </ul>

        {/* Subscription */}
        <div className="mt-5 flex flex-col justify-between gap-4 border border-[#2B1B14]/10 bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center ${
                premium
                  ? "bg-[#EAF4E8] text-[#3D8545]"
                  : "bg-[#FFF1DD] text-[#E8452C]"
              }`}
            >
              <Crown className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6258]">
                Current subscription plan
              </p>
              <p className="mt-1 text-xl font-extrabold text-[#2B1B14]">
                {premium ? "Premium" : "Free"}
              </p>
              <p className="mt-1 text-sm text-[#7A6258]">
                {premium
                  ? "Unlimited active items, premium badge and featured placement."
                  : `Up to ${plan?.activeItemLimit ?? 3} active items. Upgrade for unlimited.`}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/vendor/subscription"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-[#E8452C] px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B]"
          >
            {premium ? "Manage plan" : "Upgrade to Premium"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/vendor/menu"
            className="inline-flex items-center gap-2 bg-[#2B1B14] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black"
          >
            My menu items
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/order"
            className="inline-flex items-center gap-2 border border-[#2B1B14]/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#2B1B14] transition hover:bg-white"
          >
            Customer orders
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/vendor/menu/new"
            className="text-sm font-bold text-[#2B1B14] transition hover:text-[#E8452C]"
          >
            Add a menu item
          </Link>
        </div>
      </div>
    </main>
  )
}

export default VendorOverviewPage
