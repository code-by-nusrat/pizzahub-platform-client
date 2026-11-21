import MyMenuPage from "@/app/components/MymenuPage"
import { getItems, BASE_URL, type MenuItem } from "@/lib/vendor-menu-api"
import { getServerUser } from "@/lib/session"

type VendorAccount = {
  businessName: string
  email: string
}

async function getVendorAccount(): Promise<VendorAccount> {
  const user = await getServerUser()
  const email = user?.email
  if (!email) throw new Error("No email in session")

  // Profile
  const profileRes = await fetch(
    `${BASE_URL}/profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )
  if (!profileRes.ok) throw new Error("No profile")

  const businessName = (await profileRes.json())?.businessName
  if (!businessName) throw new Error("No business name")

  return { businessName, email }
}

async function getPlan(email: string): Promise<{
  premium: boolean
  activeItemLimit: number | null
} | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/subscription/${encodeURIComponent(email)}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}

export default async function MyMenuItemsPage() {
  let menu: MenuItem[]
  let premium = false
  let activeItemLimit: number | null = 3

  try {
    const { businessName, email } = await getVendorAccount()
    menu = await getItems(businessName)

    const plan = await getPlan(email)
    premium = Boolean(plan?.premium)
    activeItemLimit = plan?.activeItemLimit ?? (premium ? null : 3)
  } catch (error) {
    console.error("Failed to load menu:", error)
    return <p className="p-6 text-red-500">Could not load menu items.</p>
  }

  return (
    <MyMenuPage
      initialItems={menu}
      premium={premium}
      activeItemLimit={activeItemLimit}
    />
  )
}
