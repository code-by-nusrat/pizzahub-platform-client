import { headers } from "next/headers"
import MyMenuPage from "@/app/components/MymenuPage"
import { getItems, BASE_URL, type MenuItem } from "@/lib/vendor-menu-api"

async function getVendorBusinessName(): Promise<string> {
  const h = await headers()
  const cookie = h.get("cookie") ?? ""
  const host = h.get("host")
  const proto = process.env.NODE_ENV === "production" ? "https" : "http"

  // Session (forward the user's cookies, since this runs on the server)
  const sessionRes = await fetch(`${proto}://${host}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  })
  if (!sessionRes.ok) throw new Error("No session")

  const email = (await sessionRes.json())?.user?.email
  if (!email) throw new Error("No email in session")

  // Profile
  const profileRes = await fetch(
    `${BASE_URL}/profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )
  if (!profileRes.ok) throw new Error("No profile")

  const businessName = (await profileRes.json())?.businessName
  if (!businessName) throw new Error("No business name")

  return businessName
}

export default async function MyMenuItemsPage() {
  let menu: MenuItem[]

  try {
    const businessName = await getVendorBusinessName()
    menu = await getItems(businessName)
  } catch (error) {
    console.error("Failed to load menu:", error)
    return <p className="p-6 text-red-500">Could not load menu items.</p>
  }

  return <MyMenuPage initialItems={menu} />
}