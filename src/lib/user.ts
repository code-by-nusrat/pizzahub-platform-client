import "server-only"
import { MongoClient } from "mongodb"
import { getSession } from "@/lib/core/server"

const g = globalThis as typeof globalThis & { mongoClient?: MongoClient }

function getDb() {
  const uri = process.env.BETTER_AUTH_DB_URI
  if (!uri) throw new Error("BETTER_AUTH_DB_URI is missing")
  g.mongoClient ??= new MongoClient(uri)
  return g.mongoClient.db("pizzahubdb")
}

// Admin only: returns every user as a plain array.
export const getUsers = async () => {
  const session = await getSession()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "admin") throw new Error("Forbidden")

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
         status:1,
          emailVerified: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray()

  return users
}