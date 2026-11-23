
import { getToken } from "@/lib/core/server"
import { BASE_URL } from "@/lib/vendor-menu-api"
import type { Profile } from "@/lib/profile-api"

type UserRole = "vendor" | "customer"

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      body?.message || `Profile request failed: ${res.status}`
    )
  }

  return body as T
}

export async function getProfile(
  email: string,
  role: UserRole
): Promise<Profile> {
  const token = await getToken()

  if (!token) {
    throw new Error("Authentication token not found. Please sign in again.")
  }

  const endpoint =
    role === "vendor" ? "vendor-profile" : "customer-profile"

  const res = await fetch(
    `${BASE_URL}/${endpoint}/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  return handleResponse<Profile>(res)
}
