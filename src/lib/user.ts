import "server-only"
import { MongoClient } from "mongodb"
import { getSession } from "@/lib/core/server"

export type UserListRow = {
  id: string
  name: string
  email: string
  image: string | null
  role: "admin" | "vendor" | "customer"
  blocked: boolean
  emailVerified: boolean
  createdAt: string | null
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient
}

function getDb() {
  const uri = process.env.BETTER_AUTH_DB_URI
  if (!uri) throw new Error("BETTER_AUTH_DB_URI is missing")

  globalForMongo.mongoClient ??= new MongoClient(uri)
  return globalForMongo.mongoClient.db("pizzahubdb")
}

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user?.email || role !== "admin") {
    throw new Error("Forbidden")
  }

  return {
    email: session.user.email.toLowerCase(),
    role,
  }
}

// Admin only: every account as a plain, serializable row.
// This reads the Better Auth `user` collection directly; the deleted admin()
// plugin is not needed for listing users.
export async function getUsers(): Promise<UserListRow[]> {
  const session = await getSession()
  requireAdmin(session)

  const users = await getDb()
    .collection("user")
    .find(
      {},
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          status: 1,
          emailVerified: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray()

  return users.map((u) => ({
    id: String(u._id ?? u.email),
    name: String(u.name ?? ""),
    email: String(u.email ?? "").toLowerCase(),
    image: typeof u.image === "string" ? u.image : null,
    role:
      u.role === "admin" || u.role === "vendor" ? u.role : "customer",
    blocked: u.status === "blocked",
    emailVerified: Boolean(u.emailVerified),
    createdAt: u.createdAt
      ? new Date(String(u.createdAt)).toISOString()
      : null,
  }))
}

// Admin only: block or unblock one account.
// The Express backend reads `status` on every request, so a blocked user is
// locked out immediately even if they still hold a valid session token.
export async function setUserBlocked(
  email: string,
  blocked: boolean
): Promise<{ ok: false; error: string } | { ok: true }> {
  const session = await getSession()
  const me = requireAdmin(session)

  const target = email.trim().toLowerCase()

  if (!target) return { ok: false, error: "An email is required" }
  if (target === me.email) {
    return { ok: false, error: "You cannot block yourself" }
  }

  const result = await getDb()
    .collection("user")
    .updateOne(
      { email: target },
      blocked
        ? {
            $set: {
              status: "blocked",
              blockedAt: new Date(),
              blockedBy: me.email,
              updatedAt: new Date(),
            },
          }
        : {
            $set: { status: "unblocked", updatedAt: new Date() },
            $unset: { blockedAt: "", blockedBy: "" },
          }
    )

  if (result.matchedCount === 0) {
    return { ok: false, error: "User not found" }
  }

  return { ok: true }
}
