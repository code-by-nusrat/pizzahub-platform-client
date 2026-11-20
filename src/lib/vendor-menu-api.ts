export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export type MenuItem = {
  _id: string
  name: string
  category: string
  price: number
  location: string
  description: string
  image?: string
  businessName?: string
  approvalStatus?: "pending" | "approved" | "rejected"
  isAvailable?: boolean
}

export type NewMenuItem = {
  name: string
  category: string
  price: number
  location: string
  description: string
  image: string
  businessName: string
}

async function request(url: string, init: RequestInit, fallback: string) {
  const res = await fetch(url, init)
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
  return request(`${BASE_URL}/menu`, json("POST", item), "Failed to add menu item")
}

export function updateItem(id: string, payload: Partial<MenuItem>) {
  return request(`${BASE_URL}/menu/${id}`, json("PATCH", payload), "Failed to update menu item")
}

export function deleteItem(id: string) {
  return request(`${BASE_URL}/menu/${id}`, { method: "DELETE" }, "Failed to delete menu item")
}

export function changeAvailability(id: string, isAvailable: boolean) {
  return request(
    `${BASE_URL}/menu/${id}/availability`,
    json("PATCH", { isAvailable }),
    "Failed to update availability"
  )
}
// Server-side fetch of the logged-in vendor's items
export async function getItems(businessName?: string): Promise<MenuItem[]> {
  const query = businessName
    ? `?businessName=${encodeURIComponent(businessName)}`
    : ""

  const data = await request(
    `${BASE_URL}/menu${query}`,
    { cache: "no-store" },
    "Failed to load menu items"
  )

  return Array.isArray(data) ? data : []
}


// Public menu: only approved items, with optional filters from the URL
// export async function getMenu(
//   params: URLSearchParams = new URLSearchParams()
// ): Promise<MenuItem[]> {
//   const query = new URLSearchParams(params)
//   query.set("approvalStatus", "approved") // customers never see pending/rejected items
// Public menu: only approved items, with optional filters
export async function getMenu(
  params: URLSearchParams | Record<string, string> = {}
): Promise<MenuItem[]> {
  const query = new URLSearchParams(params)
  query.set("approvalStatus", "approved") // customers never see pending/rejected items

  const data = await request(
    `${BASE_URL}/browse-menu?${query.toString()}`,
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
  