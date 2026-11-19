
import { BASE_URL } from "@/lib/vendor-menu-api"

export type Profile = {
  email: string
  role: string
  name: string
  phone: string
  address: string
  bio: string
  image: string
  businessName: string
  businessLocation: string
  openingHours: string
  createdAt?: string
}

export type ProfileUpdate = Partial<
  Omit<Profile, "email" | "role" | "createdAt">
>

export async function getProfile(email: string): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.message || "Failed to load profile")
  }

  return body
}

export async function updateProfile(
  email: string,
  data: ProfileUpdate
): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/profile/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body.message || "Failed to update profile")
  }

  return body
}
