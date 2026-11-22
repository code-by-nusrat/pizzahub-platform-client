
import { requireRole } from "@/lib/core/server"
import type { ReactNode } from "react"

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireRole("customer")

  return <>{children}</>
}
