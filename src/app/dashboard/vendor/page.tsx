import { redirect } from "next/navigation"

// /dashboard/vendor has no page of its own; send vendors to their overview
export default function VendorIndexPage() {
  redirect("/dashboard/vendor/overview")
}