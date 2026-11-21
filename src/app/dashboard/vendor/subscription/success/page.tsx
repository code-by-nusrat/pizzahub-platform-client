import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

import PaymentReceipt from "@/app/components/PaymentReceipt"
import { verifyCheckout } from "@/lib/payments-api"

const PLANS_PATH = "/dashboard/vendor/subscription"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>
}) {
  const params = await searchParams
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id

  // Reached without a checkout session: nothing to confirm
  if (!sessionId) redirect(PLANS_PATH)

  const result = await verifyCheckout(sessionId)

  if (!result.success || !result.transaction) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </span>

          <h1 className="mt-4 text-2xl font-extrabold text-[#2B1B14]">
            We could not confirm this payment yet
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-[#7A6258]">
            {result.message ||
              "The payment could not be verified. If money left your card, contact support with your Stripe receipt."}
          </p>

          <Link
            href={PLANS_PATH}
            className="mt-6 inline-flex h-11 items-center justify-center bg-[#E8452C] px-6 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
          >
            Back to my plan
          </Link>
        </div>
      </section>
    )
  }

  return (
    <PaymentReceipt
      transaction={result.transaction}
      alreadyProcessed={Boolean(result.alreadyProcessed)}
    />
  )
}
