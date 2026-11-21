import { redirect } from "next/navigation"

// Old Stripe return URL. Payments are confirmed on the real success page now.
export default async function LegacyCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>
}) {
  const params = await searchParams
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id

  if (!sessionId) redirect("/dashboard/vendor/subscription")

  redirect(
    `/dashboard/vendor/subscription/success?session_id=${encodeURIComponent(
      sessionId
    )}`
  )
}
