
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getProfile } from "@/lib/profile-server"

// A vendor must complete these fields before using the dashboard.
const REQUIRED_VENDOR_FIELDS = [
  "name",
  "businessName",
  "businessLocation",
  "openingHours",
] as const

export function isVendorProfileComplete(
  profile: Record<string, unknown> | null | undefined
) {
  if (!profile) return false

  return REQUIRED_VENDOR_FIELDS.every((field) => {
    const value = profile[field]
    return typeof value === "string" && value.trim().length > 0
  })
}

export async function requireVendorProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.email) {
    redirect("/sign-in")
  }

  const role = (
    session.user as { role?: string }
  ).role?.toLowerCase()

  // Only vendors need to complete business profile fields.
  if (role !== "vendor") return session

  let profile: Record<string, unknown> | null = null

  try {
    profile = (await getProfile(
      session.user.email,
      "vendor"
    )) as Record<string, unknown>
  } catch (error) {
    console.error("Could not load vendor profile:", error)
  }

  if (!isVendorProfileComplete(profile)) {
    redirect("/dashboard/profile?setup=1")
  }

  return session
}
