import MyMenuPage from "@/app/components/MymenuPage"
import { getItems, type MenuItem } from "@/lib/vendor-menu-api"

export default async function MyMenuItemsPage() {
  let menu: MenuItem[]

  try {
    menu = await getItems()
  } catch (error) {
    console.error("Failed to load menu:", error)
    return <p className="p-6 text-red-500">Could not load menu items.</p>
  }

  return <MyMenuPage initialItems={menu} />
}