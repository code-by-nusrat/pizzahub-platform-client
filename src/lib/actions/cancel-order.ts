"use server"

import { getSession } from "@/lib/core/server"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

// The customer's email comes from the login session on the server,
// never from the browser, so nobody can cancel another customer's order.
export async function cancelOrder(
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession()
  const token = session?.session?.token

  if (!token) return { success: false, message: "Please sign in again." }

  try {
    const res = await fetch(
      `${API}/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
        cache: "no-store",
      }
    )

    const data = await res.json().catch(() => null)

    return {
      success: Boolean(res.ok && data?.success),
      message: data?.message,
    }
  } catch {
    return { success: false, message: "Could not reach the server." }
  }
}