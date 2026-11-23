//------i use token in verify checkout---




import { getToken } from "./core/server"
import { BASE_URL } from "./vendor-menu-api"

// One row of the read-only `transactions` collection
export type Transaction = {
  _id?: string
  sessionId: string
  userId?: string
  vendorName: string
  vendorEmail: string
  plan: string
  premium?: boolean
  amount: number
  currency: string
  status: string
  payment_status: string
  stripeCustomerId?: string | null
  subscriptionId?: string | null
  payment_date: string
  createdAt?: string
}

export type VerifyResult = {
  success: boolean
  alreadyProcessed?: boolean
  message?: string
  transaction?: Transaction
}


export async function verifyCheckout(
  sessionId: string
): Promise<VerifyResult> {
  // Outside try/catch on purpose: a redirect to /unauthorized must not be swallowed
  const token = await getToken()

  try {
    const res = await fetch(`${BASE_URL}/payments/checkout-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      console.error("verifyCheckout failed:", res.status, data)
      return {
        success: false,
        message:
          data?.message || `Payment verification failed (HTTP ${res.status}).`,
      }
    }

    if (!data) {
      return {
        success: false,
        message: "The payment server did not answer. Please try again.",
      }
    }

    return data
  } catch (error) {
    console.error("verifyCheckout error:", error)
    return {
      success: false,
      message: "Could not reach the payment server. Please try again.",
    }
  }
}

// Payment history. The backend checks the token and decides what you may see:
// admins get every transaction, vendors only their own.
export async function getTransactions(): Promise<Transaction[]> {
  // Outside try/catch on purpose: a redirect to /unauthorized must not be swallowed
  const token = await getToken()

  try {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Failed to fetch transactions:", res.status)
      return []
    }

    const data = await res.json().catch(() => null)

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Transaction fetch error:", error)
    return []
  }
}

export function formatMoney(amount: number, currency = "USD") {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function formatTransactionDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}