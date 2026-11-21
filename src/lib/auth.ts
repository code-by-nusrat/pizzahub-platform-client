// import { betterAuth } from "better-auth";
// import { MongoClient } from "mongodb";
// import { mongodbAdapter } from "@better-auth/mongo-adapter";

// const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
// const db = client.db("pizzahubdb");

// export const auth = betterAuth({

//     emailAndPassword: {
//         enabled: true,
//     },
//     user: {
//         additionalFields: {
//             role: {
//                 type: ['vendor','customer','admin'],
//                 // required: false,
//                 defaultValue: "customer",
//                 input: true,
//             },
//         },
//     },
//     socialProviders: {
//         google: {
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         },
//     },
//     database: mongodbAdapter(db, {
//         client,
//     }),
// });
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { admin } from "better-auth/plugins"

const uri = process.env.BETTER_AUTH_DB_URI

if (!uri) {
  throw new Error("BETTER_AUTH_DB_URI is missing")
}

// Reuse the same MongoDB client during Next.js hot reloads.
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

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  user: {
    additionalFields: {
      role: {
        type: ["vendor", "customer", "admin"],
        required: false,
        defaultValue: "customer",
        // The sign-up form may send "vendor" or "customer".
        // The hook below makes sure "admin" can never be chosen here.
        input: true,
      },
    },
  },
 plugins:[
    admin()
 ],
  databaseHooks: {
    user: {
      create: {
        // Runs for every new account, including Google sign-ups.
        before: async (newUser) => {
          const role = (newUser as { role?: string }).role

          return {
            data: {
              ...newUser,
              role: role === "vendor" ? "vendor" : "customer",
            },
          }
        },
      },
    },
  },

  // Google sign-in is switched on only when both keys exist in .env.
  // This also removes the "missing clientId or clientSecret" warning.
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},
})