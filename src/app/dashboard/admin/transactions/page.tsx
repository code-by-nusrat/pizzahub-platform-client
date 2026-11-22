import { Lock, ShieldCheck, Wallet } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import TransactionsTable from "@/app/components/TransactionsTable"
import {
  formatMoney,
  getTransactions,
  type Transaction,
} from "@/lib/payments-api"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// Admin-only: /dashboard/admin/layout.tsx already redirects every other role.
// Payment records are read-only — there is no edit action anywhere on purpose.
export default async function AdminTransactionsPage() {
  const transactions: Transaction[] = await getTransactions()

  const paid = transactions.filter(
    (transaction) =>
      transaction.payment_status === "paid" && transaction.status === "complete"
  )

  const totalByCurrency = paid.reduce<Record<string, number>>(
    (totals, transaction) => {
      const currency = transaction.currency || "USD"
      totals[currency] = (totals[currency] || 0) + Number(transaction.amount || 0)
      return totals
    },
    {}
  )

  const collected =
    Object.keys(totalByCurrency).length === 0
      ? formatMoney(0)
      : Object.entries(totalByCurrency)
          .map(([currency, total]) => formatMoney(total, currency))
          .join(" + ")

  return (
    <main className="min-h-screen space-y-6 bg-[#FFF8EC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-linear-to-r from-[#E8452C] to-[#F2751A] p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h1
              className={`${display.className} text-2xl font-extrabold sm:text-3xl`}
            >
              Transactions
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Vendor info, subscription plan, amount, payment status and
              transaction date.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold">
            <Lock className="h-3.5 w-3.5" />
            Read-only records
          </span>
        </div>

        {/* Summary */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#2B1B14]/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7A6258]">Transactions</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
              {transactions.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#2B1B14]/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-[#7A6258]">Verified payments</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
              {paid.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#2B1B14]/10 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-1.5 text-sm text-[#7A6258]">
              <Wallet className="h-3.5 w-3.5" />
              Collected
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
              {collected}
            </h2>
          </div>
        </div>

        {/* Read-only note */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#2B1B14]/10 bg-[#FFF1DD] p-4 text-sm text-[#7A6258]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#E8452C]" />
          <p>
            Payment records come straight from Stripe confirmations and cannot
            be edited, deleted or marked as paid by hand. A failed payment can
            only become successful through another verified Stripe checkout.
          </p>
        </div>

        <TransactionsTable transactions={transactions} showVendor />
      </div>
    </main>
  )
}
