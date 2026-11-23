import { redirect } from "next/navigation"

import { getSession } from "@/lib/core/server"
import { getUsers } from "@/lib/user"
import UsersManager from "./UsersManager"

const AdminUsersPage = async () => {
  const session = await getSession()
  if (!session?.user?.email) redirect("/sign-in")

  const me = session.user as { email: string; role?: string }
  if (me.role !== "admin") redirect("/dashboard")

  // getUsers() already returns plain, serializable rows for the table.
  const users = await getUsers()

  return (
    <UsersManager users={users} currentEmail={me.email.toLowerCase()} />
  )
}

export default AdminUsersPage
