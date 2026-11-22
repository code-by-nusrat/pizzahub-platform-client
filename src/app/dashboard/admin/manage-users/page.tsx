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
  const raw = ((await getUsers()) ?? []) as Record<string, unknown>[]

  const users: UserRow[] = raw.map((u) => ({
    id: String(u._id ?? u.id ?? u.email),
    name: String(u.name ?? ""),
    email: String(u.email ?? "").toLowerCase(),
    image: typeof u.image === "string" ? u.image : null,
    role: typeof u.role === "string" && ["admin", "vendor", "customer"].includes(u.role) ? (u.role as UserRow["role"]) : "customer",
    emailVerified: Boolean(u.emailVerified),
    blocked: u.status === "blocked",
    createdAt: u.createdAt ? new Date(String(u.createdAt)).toISOString() : null,
  }))

  return <UsersManager users={users} currentEmail={me.email.toLowerCase()} />
}

export default AdminUsersPage