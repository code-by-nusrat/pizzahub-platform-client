
"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { BASE_URL } from "@/lib/vendor-menu-api"
import type { Profile, ProfileUpdate } from "@/lib/profile-api"

type UpdateProfileResult =
  | {
      success: true
      message: string
      profile: Partial<Profile>
    }
  | {
      success: false
      message: string
    }

export async function updateProfileAction(
  data: ProfileUpdate
): Promise<UpdateProfileResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.email || !session.session?.token) {
      return {
        success: false,
        message: "Please sign in again.",
      }
    }

    const email = session.user.email
    const role = (session.user as { role?: string }).role

    if (role !== "vendor" && role !== "customer") {
      return {
        success: false,
        message: "You cannot update this profile.",
      }
    }

    const endpoint =
      role === "vendor" ? "vendor-profile" : "customer-profile"

    const response = await fetch(
      `${BASE_URL}/${endpoint}/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.token}`,
        },
        body: JSON.stringify(data),
        cache: "no-store",
      }
    )

    const result = await response.json()

    if (!response.ok || result.success === false) {
      return {
        success: false,
        message: result.message || "Failed to update profile.",
      }
    }

    return {
      success: true,
      message: result.message || "Profile updated successfully.",
      profile: result,
    }
  } catch (error) {
    console.error("Profile update action error:", error)

    return {
      success: false,
      message: "Something went wrong while updating your profile.",
    }
  }
}
