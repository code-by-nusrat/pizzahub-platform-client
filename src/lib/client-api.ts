"use client"

import { authClient } from "@/lib/auth-client"

// Reads the Better Auth session token in the browser and returns it.
// The Express backend verifies this exact token on every private route.
export async function getClientToken(): Promise<string> {
  const { data } = await authClient.getSession()
  const token = data?.session?.token

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  return token
}

// fetch() wrapper for browser components. It adds the Bearer token that the
// backend's verifyToken middleware expects, so no page has to build the
// Authorization header by hand.
export async function clientFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getClientToken()
  const headers = new Headers(init.headers)

  if (
    init.body &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  headers.set("Authorization", `Bearer ${token}`)

  return fetch(input, { cache: "no-store", ...init, headers })
}
