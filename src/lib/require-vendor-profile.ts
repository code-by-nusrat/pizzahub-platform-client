import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getProfile } from "@/lib/profile-api"

// A vendor must fill these in before using the dashboard.
// Add or remove names here to change what "complete" means.
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

// Call this at the top of every vendor page.
// - not signed in           -> sign-in page
// - customer or admin       -> nothing happens, they pass
// - vendor, profile missing -> sent to /dashboard/profile
export async function requireVendorProfile() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.email) redirect("/sign-in")

  const role = (session.user as { role?: string }).role
  if (role !== "vendor") return session

  let profile: Record<string, unknown> | null = null
  try {
    profile = (await getProfile(session.user.email)) as unknown as Record<
      string,
      unknown
    > | null
  } catch {
    profile = null
  }

  if (!isVendorProfileComplete(profile)) {
    redirect("/dashboard/profile?setup=1")
  }

  return session
}