"use server"

import { revalidatePath } from "next/cache"

import { setUserBlocked as setUserBlockedInDb } from "@/lib/user"

export async function setUserBlocked(email: string, blocked: boolean) {
  const result = await setUserBlockedInDb(email, blocked)

  if (!result.ok) return result

  revalidatePath("/dashboard/admin/manage-users")
  return { ok: true as const }
}
