import { requireVendorProfile } from "@/lib/require-vendor-profile"

// Covers every page inside /dashboard/vendor/* (menu, add menu item, subscription)
export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireVendorProfile()
  return <>{children}</>
}