"use server"

import { MongoClient } from "mongodb"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/core/server"

const g = globalThis as typeof globalThis & { mongoClient?: MongoClient }

function getDb() {
    const uri = process.env.BETTER_AUTH_DB_URI
    if (!uri) throw new Error("BETTER_AUTH_DB_URI is missing")
    g.mongoClient ??= new MongoClient(uri)
    return g.mongoClient.db("pizzahubdb")
}

export async function setUserBlocked(email: string, blocked: boolean) {
    const session = await getSession()
    const me = session?.user as { email?: string; role?: string } | undefined

    if (me?.role !== "admin") return { ok: false, error: "Not allowed" }

    const target = email.trim().toLowerCase()
    if (target === me.email?.toLowerCase()) {
        return { ok: false, error: "You cannot block yourself" }
    }

    //   const res = await getDb()
    //     .collection("user")
    //     .updateOne(
    //       { email: target },
    //       blocked
    //         ? {
    //             $set: {
    //               status:"blocked",
    //               blockedAt: new Date(),
    //               blockedBy: me.email,
    //               updatedAt: new Date(),
    //             },
    //           }
    //         : {
    //             $set: { blocked: false, updatedAt: new Date() },
    //             $unset: { blockedAt: "", blockedBy: "" },
    //           },
    //     )
    const res = await getDb()
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
                },
        )
    if (res.matchedCount === 0) return { ok: false, error: "User not found" }

    revalidatePath("/dashboard/admin/manage-users")
    return { ok: true }
}