"use server"

import { getSession } from "@/lib/core/server"
import { sendOrderDecisionEmail } from "@/lib/email"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type VendorOrder = {
  _id?: string
  customer?: { name?: string; email?: string }
  businessName?: string
  items?: { name?: string; quantity?: number; price?: number }[]
  total?: number
  delivery?: { address?: string; date?: string; note?: string }
}

// Only the vendor's own orders are returned by the backend, so a match here
// also proves the order belongs to the signed-in vendor.
async function findVendorOrder(
  token: string,
  orderId: string
): Promise<VendorOrder | null> {
  try {
    const res = await fetch(`${API}/vendor/orders`, {
      cache: "no-store",
      headers: { authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null

    const data = (await res.json().catch(() => null)) as {
      orders?: VendorOrder[]
    } | null

    return (
      data?.orders?.find((order) => String(order._id) === String(orderId)) ??
      null
    )
  } catch {
    return null
  }
}

// The vendor's email comes from the login session on the server,
// never from the browser.
export async function decideOrder(
  orderId: string,
  status: "accepted" | "rejected"
): Promise<{ success: boolean; message?: string }> {
  const session = await getSession()
  const token = session?.session?.token

  if (!token) return { success: false, message: "Please sign in again." }

  try {
    // Read the order first: it carries the customer address and the summary
    // used by the notification. Reading before the update means a failed
    // follow-up request cannot cost the customer their email.
    const order = await findVendorOrder(token, orderId)

    const res = await fetch(
      `${API}/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
        cache: "no-store",
      }
    )

    const data = await res.json().catch(() => null)
    const success = Boolean(res.ok && data?.success)

    // A mail failure must never change the vendor's result: the decision is
    // already saved by the backend at this point.
    if (success && order?.customer?.email) {
      try {
        const email = await sendOrderDecisionEmail({
          to: order.customer.email,
          status,
          orderId: String(order._id ?? orderId),
          customerName: order.customer.name,
          businessName: order.businessName,
          items: order.items,
          total: order.total,
          delivery: order.delivery,
        })

        if (!email.ok) {
          console.warn(
            "[orders] Decision saved but no email was sent:",
            email.error
          )
        }
      } catch (error) {
        console.error("[orders] Unexpected email failure:", error)
      }
    }

    return {
      success,
      message: data?.message,
    }
  } catch {
    return { success: false, message: "Could not reach the server." }
  }
}
