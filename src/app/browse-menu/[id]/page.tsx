import type { Metadata } from "next"

import MenuItemDetails from "@/app/components/MenuItemDetails"

export const metadata: Metadata = {
    title: "Menu item | PizzaHub",
    description:
        "See the full description, price, kitchen and location of this dish before you order.",
}

// Kept for links created before /menu/[id] became the canonical route.
export default async function BrowseMenuItemPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <MenuItemDetails id={id} />
}
