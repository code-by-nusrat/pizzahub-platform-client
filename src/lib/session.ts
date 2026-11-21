import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export type SessionUser = {
  id?: string
  email?: string
  name?: string
  role?: string
}

// Reads the better-auth session directly on the server. Using the auth API
// avoids a self-fetch to /api/auth/get-session during rendering.
export async function getServerSession() {
  try {
    return await auth.api.getSession({ headers: await headers() })
  } catch {
    return null
  }
}

export async function getServerUser(): Promise<SessionUser | null> {
  const session = await getServerSession()
  return (session?.user as SessionUser | undefined) ?? null
}
