import { clientFetch } from "./client-api"

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export type MenuItem = {
  _id: string
  name: string
  email?: string
  category: string
  price: number
  location: string
  description: string
  image?: string
  businessName?: string
  vendorEmail?: string
  approvalStatus?: "pending" | "approved" | "rejected"
  isAvailable?: boolean
  createdAt?: string
}

export type NewMenuItem = {
  name: string
  email?: string
  category: string
  price: number
  location: string
  description: string
  image: string
  businessName: string
}


async function request(
  url: string,
  init: RequestInit,
  fallback: string
) {
  try {
    const res = await fetch(url, init)
    const contentType = res.headers.get("content-type")

    if (!contentType?.includes("application/json")) {
      const message = await res.text()
      throw new Error(
        message || `Server returned ${res.status}`
      )
    }

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || fallback)
    }

    return data
  } catch (error) {
    console.error("API request failed:", url, error)

    throw error instanceof Error
      ? error
      : new Error(fallback)
  }
}


// Same as request(), but attaches the signed-in user's Bearer token.
async function authRequest(
  url: string,
  init: RequestInit,
  fallback: string
) {
  const res = await clientFetch(url, init)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || fallback)
  return data
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

// Uploads through the Next.js route so the ImgBB key stays on the server
export async function uploadMenuImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("image", file)

  const data = await request(
    "/api/imgbb", // must match app/api/imgbb/route.ts
    { method: "POST", body: fd },
    "Image upload failed"
  )

  if (!data?.url) throw new Error("Image upload returned no URL")
  return data.url
}

export function addItem(item: NewMenuItem) {
  return authRequest(
    `${BASE_URL}/menu`,
    json("POST", item),
    "Failed to add menu item"
  )
}

export function updateItem(id: string, payload: Partial<MenuItem>) {
  return authRequest(
    `${BASE_URL}/menu/${id}`,
    json("PUT", payload),
    "Failed to update menu item"
  )
}

export function deleteItem(id: string) {
  return authRequest(
    `${BASE_URL}/menu/${id}`,
    { method: "DELETE" },
    "Failed to delete menu item"
  )
}

export function changeAvailability(id: string, isAvailable: boolean) {
  return authRequest(
    `${BASE_URL}/menu/${id}/availability`,
    json("PATCH", { isAvailable }),
    "Failed to update availability"
  )
}

// Public menu: only approved items, with optional filters from the URL
// export async function getMenu(
//   params: URLSearchParams | Record<string, string> = {}
// ): Promise<MenuItem[]> {
//   const query = new URLSearchParams(params)

//   const data = await request(
//     `${BASE_URL}/browse-menu?${query.toString()}`,
//     { cache: "no-store" },
//     "Failed to load menu"
//   )

//   return Array.isArray(data) ? data : []
// }


export async function getMenu(
  params: URLSearchParams | Record<string, string> = {}
): Promise<MenuItem[]> {
  const query = new URLSearchParams()

  const entries =
    params instanceof URLSearchParams
      ? Array.from(params.entries())
      : Object.entries(params)

  entries.forEach(([key, value]) => {
    const cleaned = value.trim()
    if (cleaned) query.set(key, cleaned)
  })

  const url = `${BASE_URL}/browse-menu${
    query.size ? `?${query.toString()}` : ""
  }`

  console.log("Fetching menu from:", url)

  const data = await request(
    url,
    { cache: "no-store" },
    "Failed to load menu"
  )

  return Array.isArray(data) ? data : []
}


// Single approved dish for the details page. Returns null if it doesn't exist.
export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const res = await fetch(`${BASE_URL}/browse-menu/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })

  if (res.status === 400 || res.status === 404) return null
  if (!res.ok) throw new Error("Failed to load menu item")

  return (await res.json()) as MenuItem
}
