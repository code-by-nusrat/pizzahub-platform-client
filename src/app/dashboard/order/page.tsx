import { redirect } from "next/navigation"

import { getSession } from "@/lib/core/server"
import VendorOrdersList from "./VendorOrdersList"
import { requireVendorProfile } from "@/lib/require-vendor-profile"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const OrderPage = async () => {
  const session = await getSession()

  if (!session?.user?.email) redirect("/sign-in")

  // Only vendors see this page
  const role = (session.user as { role?: string }).role
  if (role !== "vendor") redirect("/dashboard")
await requireVendorProfile()
  let orders = []
  let businessName = ""
  let errorMessage: string | null = null

  try {
    const res = await fetch(
      `${API}/vendor/orders?email=${encodeURIComponent(session.user.email)}`,
      { cache: "no-store" }
    )
    const data = await res.json().catch(() => null)

    if (res.ok && data?.success) {
      orders = data.orders
      businessName = data.businessName
    } else {
      errorMessage = data?.message || "We could not load your orders."
    }
  } catch {
    errorMessage = "We could not reach the server."
  }

  return (
    <VendorOrdersList
      orders={orders}
      businessName={businessName}
      errorMessage={errorMessage}
    />
  )
}

export default OrderPage