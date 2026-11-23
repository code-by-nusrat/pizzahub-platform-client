import { redirect } from "next/navigation"

import SubscriptionPlans from "@/app/components/SubscriptionPlans"
import TransactionsTable from "@/app/components/TransactionsTable"
import { getSession } from "@/lib/core/server"
import { getTransactions } from "@/lib/payments-api"
import { getVendorPlan } from "@/lib/vendor-menu-server"

type SearchParams = Record<string, string | string[] | undefined>

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  const role = (session.user as { role?: string }).role
  const isVendor = role === "vendor"

  // Both helpers attach the Better Auth token, which is what the backend
  // uses to decide which vendor's plan and payments may be read.
  const plan = isVendor ? await getVendorPlan() : null
  const currentPlan: "free" | "premium" = plan?.premium ? "premium" : "free"

  const transactions = isVendor ? await getTransactions() : []

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <SubscriptionPlans
          currentPlan={currentPlan}
          isVendor={isVendor}
          searchParams={params}
        />

        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-[#2B1B14]">
            Payment history
          </h2>
          <p className="mt-1 text-sm text-[#7A6258]">
            Verified Stripe payments for your subscription appear here.
          </p>

          <div className="mt-4">
            <TransactionsTable
              transactions={transactions}
              showVendor={false}
              emptyMessage="No subscription payments yet."
            />
          </div>
        </section>
      </div>
    </main>
  )
}
