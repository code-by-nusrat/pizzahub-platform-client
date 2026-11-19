import { redirect } from "next/navigation"

// The vendor profile now lives in the shared /dashboard/profile page.
export default function VendorProfileRoute() {
  redirect("/dashboard/profile")
}
