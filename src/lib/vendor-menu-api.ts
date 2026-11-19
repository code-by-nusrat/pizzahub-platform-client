export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export type MenuItem = {
  _id: string
  name: string
  category: string
  description: string
  price: number
  location: string
  image: string
  createdAt: string
  approvalStatus: "pending" | "approved" | "rejected"
  isAvailable: boolean
}

export type UpdateItemPayload = {
  name: string
  price: number
  location: string
  description: string
}

export type NewItemPayload = {
  name: string
  category: string
  price: number
  location: string
  description: string
  image: string
}

// Get all menu items
export async function getItems(query:string =""): Promise<MenuItem[]> {
  const res = await fetch(`${BASE_URL}/menu?${query}`, { cache: "no-store" })

  if (!res.ok) throw new Error("Failed to load menu items")

  const data = await res.json()

  // Works whether the API returns [...] or { menu: [...] } / { items: [...] }
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.menu)) return data.menu
  if (Array.isArray(data?.items)) return data.items
  return []
}

// Add new item (JSON, the photo is a link)
export async function addItem(data: NewItemPayload) {
  const res = await fetch(`${BASE_URL}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials: "include", // or add your Authorization header here
    body: JSON.stringify(data),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Failed to add item")
  return body
}

// Update item
export async function updateItem(id: string, data: UpdateItemPayload) {
  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    // credentials: "include", // or add your Authorization header here
    body: JSON.stringify(data),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Failed to update item")
  return body
}

// Delete item
export async function deleteItem(id: string) {
  const res = await fetch(`${BASE_URL}/menu/${id}`, {
    method: "DELETE",
    // credentials: "include", // or add your Authorization header here
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Failed to delete item")
  return body
}

// Change availability
export async function changeAvailability(id: string, isAvailable: boolean) {
  const res = await fetch(`${BASE_URL}/menu/${id}/availability`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAvailable }),
  })

  const data = await res.json()

  if (!res.ok) throw new Error(data.message || "Update failed")

  return data
}