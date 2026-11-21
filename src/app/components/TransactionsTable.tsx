import { Receipt } from "lucide-react"

import {
  formatMoney,
  formatTransactionDate,
  type Transaction,
} from "@/lib/payments-api"

type TransactionsTableProps = {
  transactions: Transaction[]
  // Admins see every vendor, so the vendor column is shown for them
  showVendor?: boolean
  emptyMessage?: string
}

// Read-only payment history. There are no edit actions on purpose: payment
// records must never be changed after Stripe confirms them.
export default function TransactionsTable({
  transactions,
  showVendor = true,
  emptyMessage = "No payments yet.",
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-[#2B1B14]/10 bg-white px-6 py-14 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
          <Receipt className="h-6 w-6" />
        </span>
        <p className="mt-4 font-bold text-[#2B1B14]">{emptyMessage}</p>
        <p className="mt-1 max-w-sm text-sm text-[#7A6258]">
          Completed Stripe payments appear here with their plan, amount, status
          and date.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2B1B14]/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#FFF8EC] text-xs uppercase tracking-wider text-[#7A6258]">
              {showVendor && <th className="px-5 py-4 font-semibold">Vendor</th>}
              <th className="px-5 py-4 font-semibold">Plan</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Payment status</th>
              <th className="px-5 py-4 font-semibold">Transaction date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2B1B14]/10">
            {transactions.map((transaction) => {
              const paid =
                transaction.payment_status === "paid" &&
                transaction.status === "complete"

              return (
                <tr
                  key={transaction._id || transaction.sessionId}
                  className="align-top transition-colors hover:bg-[#FFF8EC]/60"
                >
                  {showVendor && (
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#2B1B14]">
                        {transaction.vendorName || "Vendor"}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-[#7A6258]">
                        {transaction.vendorEmail || "—"}
                      </p>
                    </td>
                  )}

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-[#2B1B14] px-3 py-1 text-xs font-semibold text-[#FFF8EC]">
                      {transaction.plan || "Premium"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-bold text-[#2B1B14]">
                    {formatMoney(transaction.amount, transaction.currency)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        paid
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {transaction.payment_status || "unknown"}
                    </span>
                    <p className="mt-1 text-xs text-[#7A6258]">
                      {transaction.status || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-[#7A6258]">
                    {formatTransactionDate(transaction.payment_date)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
