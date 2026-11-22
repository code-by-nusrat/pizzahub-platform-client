import { redirect } from "next/navigation"
import { getSession } from "@/lib/core/server"
import { getUsers } from "@/lib/user"
import UsersManager, { type UserRow } from "./UsersManager"

const AdminUsersPage = async () => {
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const me = session.user as { email: string; role?: string }
  if (me.role !== "admin") redirect("/dashboard")

  // Turn whatever getUsers() returns into plain, serializable rows
  const raw = ((await getUsers()) ?? []) as Record<string, any>[]

  const users: UserRow[] = raw.map((u) => ({
    id: String(u._id ?? u.id ?? u.email),
    name: u.name ?? "",
    email: String(u.email ?? "").toLowerCase(),
    image: u.image ?? null,
    role: ["admin", "vendor", "customer"].includes(u.role) ? u.role : "customer",
    emailVerified: Boolean(u.emailVerified),
    blocked: u.status === "blocked",
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
  }))

  return <UsersManager users={users} currentEmail={me.email.toLowerCase()} />
}

export default AdminUsersPage