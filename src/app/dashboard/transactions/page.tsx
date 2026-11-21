import Link from "next/link"
import { Lock, ShieldX, Wallet } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import TransactionsTable from "@/app/components/TransactionsTable"
import {
  formatMoney,
  getTransactions,
  type Transaction,
} from "@/lib/payments-api"
import { getServerUser } from "@/lib/session"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen space-y-6 bg-[#FFF8EC] p-4 sm:p-6">{children}</div>
  )
}

export default async function TransactionsPage() {
  const user = await getServerUser()

  if (!user) {
    return (
      <Shell>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#2B1B14]/10 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-[#2B1B14]">
            Sign in required
          </h1>
          <p className="mt-2 text-sm text-[#7A6258]">
            Transaction records are only available to administrators.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex h-11 items-center justify-center bg-[#E8452C] px-6 text-sm font-bold uppercase tracking-wider text-white"
          >
            Sign in
          </Link>
        </div>
      </Shell>
    )
  }

  if (user.role !== "admin") {
    return (
      <Shell>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#2B1B14]/10 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
            <ShieldX className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-[#2B1B14]">
            Admins only
          </h1>
          <p className="mt-2 text-sm text-[#7A6258]">
            You do not have permission to view every payment record.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center border border-[#2B1B14]/20 px-6 text-sm font-bold uppercase tracking-wider text-[#2B1B14]"
          >
            Back to dashboard
          </Link>
        </div>
      </Shell>
    )
  }

  const transactions: Transaction[] = await getTransactions()

  const paid = transactions.filter(
    (t) => t.payment_status === "paid" && t.status === "complete"
  )

  const totalByCurrency = paid.reduce<Record<string, number>>((totals, t) => {
    const currency = t.currency || "USD"
    totals[currency] = (totals[currency] || 0) + Number(t.amount || 0)
    return totals
  }, {})

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-linear-to-r from-[#E8452C] to-[#F2751A] p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className={`${display.className} text-2xl font-extrabold sm:text-3xl`}>
            Transactions
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Vendor info, plan, amount, payment status and transaction date.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold">
          <Lock className="h-3.5 w-3.5" />
          Read-only records
        </span>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Transactions</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
            {transactions.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Verified payments</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
            {paid.length}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <Wallet className="h-3.5 w-3.5" />
            Collected
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
            {Object.keys(totalByCurrency).length === 0
              ? formatMoney(0)
              : Object.entries(totalByCurrency)
                  .map(([currency, total]) => formatMoney(total, currency))
                  .join(" + ")}
          </h2>
        </div>
      </div>

      {/* Read-only note */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#2B1B14]/10 bg-[#FFF1DD] p-4 text-sm text-[#7A6258]">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#E8452C]" />
        <p>
          Payment records come straight from Stripe confirmations and cannot be
          edited, deleted or marked as paid by hand. A failed payment can only
          become successful through another verified Stripe checkout.
        </p>
      </div>

      <TransactionsTable transactions={transactions} showVendor />
    </Shell>
  )
}
