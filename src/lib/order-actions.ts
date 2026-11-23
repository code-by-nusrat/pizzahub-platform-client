"use server"


//-----i use token -----
import { getToken } from "@/lib/core/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function placeOrder(payload: unknown) {
  const token = await getToken()

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return { success: res.ok && data.success !== false, message: data.message as string | undefined }
  } catch {
    return { success: false, message: "Could not reach the server." }
  }
}