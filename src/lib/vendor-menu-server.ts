import { authfetch, getSession } from "./core/server"
import { BASE_URL, type MenuItem } from "./vendor-menu-api"

export type VendorPlan = {
  premium: boolean
  plan?: string
  activeItemLimit: number | null
}

// Server-side fetch of the logged-in vendor's items.
// The backend scopes vendors to their own dishes, so no email is needed.
export async function getItems(): Promise<MenuItem[]> {
  const query = new URLSearchParams({ approvalStatus: "all" })

  const res = await authfetch(`${BASE_URL}/menu?${query.toString()}`)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || "Failed to load menu items")
  }

  return Array.isArray(data) ? data : []
}

// The signed-in vendor's current subscription plan.
export async function getVendorPlan(): Promise<VendorPlan | null> {
  const session = await getSession()
  const email = session?.user?.email

  if (!email) return null

  try {
    const res = await authfetch(
      `${BASE_URL}/subscription/${encodeURIComponent(email)}`
    )

    if (!res.ok) return null

    return (await res.json()) as VendorPlan
  } catch {
    return null
  }
}
