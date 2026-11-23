// import { redirect } from "next/navigation"

// import { getSession } from "@/lib/core/server"
// import OrdersList from "./OrderList"

// const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

// const CustomerOrderPage = async () => {
//   const session = await getSession()

//   if (!session?.user?.email) redirect("/sign-in")

//   let orders: Parameters<typeof OrdersList>[0]["orders"] = []
//   let failed = false

//   try {
//     const res = await fetch(
//       `${API}/orders?email=${encodeURIComponent(session.user.email)}`,
//       { cache: "no-store" }
//     )
//     if (res.ok) {
//       orders = await res.json()
//     } else {
//       failed = true
//     }
//   } catch {
//     failed = true
//   }

//   return <OrdersList orders={orders} failed={failed} />
// }

// export default CustomerOrderPage

import { redirect } from "next/navigation"
import { getSession, getToken } from "@/lib/core/server"
import OrdersList from "./OrderList"

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

const CustomerOrderPage = async () => {
  const session = await getSession()

  if (!session?.user?.email) {
    redirect("/sign-in")
  }

  let orders: Parameters<typeof OrdersList>[0]["orders"] = []
  let failed = false

  try {
    // Get the logged-in user's Better Auth token
    const token = await getToken()

    const res = await fetch(`${API}/orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error("GET ORDERS ERROR:", res.status, errorData)
      failed = true
    } else {
      const data = await res.json()

      // Your Express GET /orders returns a plain array
      if (Array.isArray(data)) {
        orders = data
      } else {
        console.error("Unexpected orders response:", data)
        failed = true
      }
    }
  } catch (error) {
    console.error("Failed to load customer orders:", error)
    failed = true
  }

  return <OrdersList orders={orders} failed={failed} />
}

export default CustomerOrderPage
