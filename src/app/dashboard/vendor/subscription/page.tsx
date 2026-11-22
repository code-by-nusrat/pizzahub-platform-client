import SubscriptionPlans from "@/app/components/SubscriptionPlans"
import TransactionsTable from "@/app/components/TransactionsTable"
import { BASE_URL } from "@/lib/vendor-menu-api"
import { getTransactions, type Transaction } from "@/lib/payments-api"
import { getSession } from "@/lib/core/server"

type SearchParams = Record<string, string | string[] | undefined>

type Plan = {
  premium: boolean
  plan: string
  activeItemLimit: number | null
}

// After a Stripe checkout, /payments/checkout-verify sets `premium: true` on
// the account. Read it so the page shows the plan the vendor actually has.
async function getPlan(email: string): Promise<Plan | null> {
  if (!email) return null

  try {
    const res = await fetch(
      `${BASE_URL}/subscription/${encodeURIComponent(email)}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { canceled } = params

  if (canceled) {
    console.log(
      "Order canceled -- continue to shop around and check out when you're ready."
    )
  }

  const session = await getSession()
  const user = session?.user as
    | { email?: string; role?: string }
    | undefined
  const email = user?.email ?? ""
  const plan = await getPlan(email)

  let transactions: Transaction[] = []
  if (email) {
    transactions = await getTransactions({ vendorEmail: email })
  }

  return (
    <div className="bg-[#FFF8EC]">
      <SubscriptionPlans
        searchParams={params}
        currentPlan={plan?.premium ? "premium" : "free"}
        isVendor={user?.role === "vendor"}
      />

      {/* Verified payments for this account */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-[#2B1B14]">
              Billing history
            </h2>
            <p className="mt-1 text-sm text-[#7A6258]">
              Vendor info, plan, amount, payment status and transaction date.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6258]">
            {plan?.premium ? "Premium plan" : "Free plan"}
          </p>
        </div>

        <TransactionsTable
          transactions={transactions}
          showVendor={false}
          emptyMessage="No payments yet — you are on the Free plan."
        />
      </section>
    </div>
  )
}
