import { redirect } from "next/navigation"

// Older link: the admin transaction view lives under the admin dashboard.
export default function LegacyTransactionsPage() {
  redirect("/dashboard/admin/transactions")
}
