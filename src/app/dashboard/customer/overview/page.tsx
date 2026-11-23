// src/app/dashboard/customer/overview/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import { getSession, getToken } from "@/lib/core/server"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type OrderLite = { status?: string }

type Stat = {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: string // colors for the icon tile
}

const CustomerOverviewPage = async () => {
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")
const token = await getToken()
  if (!token) redirect("/sign-in")
  let orders: OrderLite[] = []
  let failed = false

  try {
   const res = await fetch(
  `${API}/orders?email=${encodeURIComponent(session.user.email)}`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }
)
    if (res.ok) {
      orders = await res.json()
    } else {
      failed = true
    }
  } catch {
    failed = true
  }

  // Orders with no status are treated as pending, same as the orders page
  const countOf = (status: string) =>
    orders.filter((o) => (o.status || "pending") === status).length

  const cancelled = countOf("cancelled")

  const stats: Stat[] = [
    {
      label: "Total orders",
      value: orders.length,
      hint: cancelled > 0 ? `Includes ${cancelled} cancelled` : "All your orders",
      icon: ClipboardList,
      tone: "bg-[#2B1B14]/10 text-[#2B1B14]",
    },
    {
      label: "Pending",
      value: countOf("pending"),
      hint: "Waiting for the kitchen",
      icon: Clock,
      tone: "bg-[#FFF0E3] text-[#C2561B]",
    },
    {
      label: "Accepted",
      value: countOf("accepted"),
      hint: "Confirmed by the kitchen",
      icon: CheckCircle2,
      tone: "bg-[#EAF4E8] text-[#3D8545]",
    },
    {
      label: "Rejected",
      value: countOf("rejected"),
      hint: "Declined by the kitchen",
      icon: XCircle,
      tone: "bg-[#FCE8E6] text-[#B3261E]",
    },
  ]

  const firstName = (session.user.name || "").split(" ")[0]

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h1
          className={`${display.className} text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
        >
          {firstName ? `Hi ${firstName}, ` : ""}
          your <span className="text-[#E8452C]">overview.</span>
        </h1>
        <p className="mt-2 text-sm text-[#7A6258]">
          A quick look at where your food orders stand.
        </p>

        {failed && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-[#E8452C] bg-white px-4 py-3 text-sm text-[#2B1B14]"
          >
            We could not load your orders. Please try again.
          </p>
        )}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <li
              key={s.label}
              className="border border-[#2B1B14]/10 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A6258]">
                  {s.label}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center ${s.tone}`}
                >
                  <s.icon className="h-4 w-4" />
                </span>
              </div>

              <p
                className={`${display.className} mt-4 text-4xl font-extrabold text-[#2B1B14]`}
              >
                {s.value}
              </p>
              <p className="mt-1 text-xs text-[#7A6258]">{s.hint}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/customer/my-order"
            className="inline-flex items-center gap-2 bg-[#E8452C] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B]"
          >
            View my orders
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/browse-menu"
            className="text-sm font-bold text-[#2B1B14] transition hover:text-[#E8452C]"
          >
            Browse menu
          </Link>
        </div>
      </div>
    </main>
  )
}

export default CustomerOverviewPage