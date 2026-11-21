import { redirect } from "next/navigation"

import { getSession } from "@/lib/core/server"
import OrdersList from "./OrderList"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const CustomerOrderPage = async () => {
  const session = await getSession()

  if (!session?.user?.email) redirect("/login")

  let orders: Parameters<typeof OrdersList>[0]["orders"] = []
  let failed = false

  try {
    const res = await fetch(
      `${API}/orders?email=${encodeURIComponent(session.user.email)}`,
      { cache: "no-store" }
    )
    if (res.ok) {
      orders = await res.json()
    } else {
      failed = true
    }
  } catch {
    failed = true
  }

  return <OrdersList orders={orders} failed={failed} />
}

export default CustomerOrderPage