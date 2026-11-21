import Link from "next/link"
import { BadgeCheck, ReceiptText } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import {
  formatMoney,
  formatTransactionDate,
  type Transaction,
} from "@/lib/payments-api"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// Confirmation shown right after Stripe sends the vendor back from checkout
export default function PaymentReceipt({
  transaction,
  alreadyProcessed = false,
}: {
  transaction: Transaction
  alreadyProcessed?: boolean
}) {
  const rows = [
    { label: "Vendor", value: transaction.vendorName || "—" },
    { label: "Account email", value: transaction.vendorEmail || "—" },
    { label: "Subscription plan", value: transaction.plan || "Premium" },
    {
      label: "Payment amount",
      value: formatMoney(transaction.amount, transaction.currency),
    },
    { label: "Payment status", value: transaction.payment_status || "—" },
    {
      label: "Transaction date",
      value: formatTransactionDate(transaction.payment_date),
    },
  ]

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <div className="overflow-hidden rounded-3xl border border-[#2B1B14]/10 bg-white shadow-sm">
        {/* Header */}
        <div className="relative bg-linear-to-r from-[#2F6B3A] to-[#3C8248] px-6 py-9 text-white sm:px-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <BadgeCheck className="h-8 w-8" />
          </span>

          <h1
            className={`${display.className} relative mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl`}
          >
            Payment successful
          </h1>

          <p className="relative mt-2 max-w-md text-white/85">
            {alreadyProcessed
              ? "This payment was already confirmed. Your Premium plan stays active."
              : "Thank you! Your Premium plan is active and your transaction is saved."}
          </p>
        </div>

        {/* Receipt */}
        <div className="px-6 py-8 sm:px-10">
          <div className="flex items-center gap-2 text-[#7A6258]">
            <ReceiptText className="h-4 w-4 text-[#E8452C]" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">
              Transaction summary
            </p>
          </div>

          <dl className="mt-5 divide-y divide-[#2B1B14]/10 border-y border-[#2B1B14]/10">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <dt className="text-sm text-[#7A6258]">{row.label}</dt>
                <dd className="break-all font-bold text-[#2B1B14] sm:text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 break-all text-xs text-[#7A6258]">
            Stripe session: {transaction.sessionId}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/vendor/subscription"
              className="flex h-11 flex-1 items-center justify-center rounded-none bg-[#E8452C] px-5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
            >
              Back to my plan
            </Link>
            <Link
              href="/dashboard/vendor/menu"
              className="flex h-11 flex-1 items-center justify-center rounded-none border border-[#2B1B14]/20 px-5 text-sm font-bold uppercase tracking-wider text-[#2B1B14] transition-colors hover:bg-[#FFF8EC]"
            >
              Manage my menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
