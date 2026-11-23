import MyMenuPage from "@/app/components/MymenuPage"
import type { MenuItem } from "@/lib/vendor-menu-api"
import { getItems, getVendorPlan } from "@/lib/vendor-menu-server"
import { requireVendorProfile } from "@/lib/require-vendor-profile"

export default async function MyMenuItemsPage() {
  await requireVendorProfile()

  let menu: MenuItem[]
  let premium = false
  let activeItemLimit: number | null = 3

  try {
    menu = await getItems()

    const plan = await getVendorPlan()

    premium = Boolean(plan?.premium)
    activeItemLimit = plan?.activeItemLimit ?? (premium ? null : 3)
  } catch (error) {
    console.error("Failed to load menu:", error)

    return (
      <p className="p-6 text-red-500">
        Could not load menu items.
      </p>
    )
  }

  return (
    <MyMenuPage
      initialItems={menu}
      premium={premium}
      activeItemLimit={activeItemLimit}
    />
  )
}
