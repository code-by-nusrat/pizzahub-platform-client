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

// Asks the backend to verify a Stripe Checkout session. The backend saves the
// transaction and upgrades the account only after Stripe confirms the payment.
export async function verifyCheckout(sessionId: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`${BASE_URL}/payments/checkout-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    })

    const data = await res.json().catch(() => null)

    if (!data) {
      return {
        success: false,
        message: "The payment server did not answer. Please try again.",
      }
    }

    return data
  } catch {
    return {
      success: false,
      message: "Could not reach the payment server. Please try again.",
    }
  }
}

// Payment history. With vendorEmail it returns only that vendor's rows.
export async function getTransactions(
  params: { vendorEmail?: string } = {}
): Promise<Transaction[]> {
  const query = new URLSearchParams()
  if (params.vendorEmail) query.set("vendorEmail", params.vendorEmail)

  const qs = query.toString()

  try {
    const res = await fetch(
      `${BASE_URL}/transactions${qs ? `?${qs}` : ""}`,
      { cache: "no-store" }
    )
    if (!res.ok) return []

    const data = await res.json().catch(() => null)
    return Array.isArray(data) ? data : []
  } catch {
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
