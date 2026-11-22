import { redirect } from "next/navigation"

import { getSession } from "@/lib/core/server"

// /dashboard sends each account to the overview that belongs to its role.
export default async function DashboardIndexPage() {
  const session = await getSession()

  if (!session?.user?.email) redirect("/sign-in")

  if ((session.user as { status?: string }).status === "blocked")
    redirect("/blocked")

  const role = (session.user as { role?: string }).role

  if (role === "admin") redirect("/dashboard/admin/overview")
  if (role === "vendor") redirect("/dashboard/vendor/overview")

  redirect("/dashboard/customer/overview")
}
