"use server"

import { getSession } from "@/lib/core/server"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

// The vendor's email comes from the login session on the server,
// never from the browser.
export async function decideOrder(
  orderId: string,
  status: "accepted" | "rejected"
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession()
  const email = session?.user?.email

  if (!email) return { success: false, message: "Please sign in again." }

  try {
    const res = await fetch(
      `${API}/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status }),
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