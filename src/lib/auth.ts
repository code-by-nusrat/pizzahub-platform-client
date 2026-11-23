
import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"


const uri = process.env.BETTER_AUTH_DB_URI

if (!uri) {
  throw new Error("BETTER_AUTH_DB_URI is missing")
}

// Reuse MongoDB client during Next.js hot reloads.
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient
}

const client = globalForMongo.mongoClient ?? new MongoClient(uri)

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client
}

const db = client.db("pizzahubdb")

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client,
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  // Custom user fields.
  //
  // The admin() plugin used to own `role`. It has been removed, so `role` is
  // declared here with `input: false`: the browser may never send or change it.
  // The sign-up form sends `requestedRole` instead, and the database hook below
  // turns that into a safe role ("admin" can never be chosen publicly).
  user: {
    additionalFields: {
      role: {
        type: ["vendor", "customer", "admin"],
        required: false,
        defaultValue: "customer",
        input: false,
      },

      requestedRole: {
        type: ["vendor", "customer"],
        required: false,
        defaultValue: "customer",
        input: true,
      },

      status: {
        type: ["unblocked", "blocked"],
        required: false,
        defaultValue: "unblocked",
        input: false,
      },
    },
  },

  // Set the real role and status for every new account.
  // "admin" can never be chosen from the sign-up form.
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const {
            requestedRole,
            ...rest
          } = newUser as { requestedRole?: string } & Record<string, unknown>

          return {
            data: {
              ...rest,
              role: requestedRole === "vendor" ? "vendor" : "customer",
              status: "unblocked",
            },
          }
        },
      },
    },
  },

  // Google authentication
  socialProviders:
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
})
