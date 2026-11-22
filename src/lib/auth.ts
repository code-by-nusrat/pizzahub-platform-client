// // import { betterAuth } from "better-auth";
// // import { MongoClient } from "mongodb";
// // import { mongodbAdapter } from "@better-auth/mongo-adapter";

// // const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
// // const db = client.db("pizzahubdb");

// // export const auth = betterAuth({

// //     emailAndPassword: {
// //         enabled: true,
// //     },
// //     user: {
// //         additionalFields: {
// //             role: {
// //                 type: ['vendor','customer','admin'],
// //                 // required: false,
// //                 defaultValue: "customer",
// //                 input: true,
// //             },
// //         },
// //     },
// //     socialProviders: {
// //         google: {
// //             clientId: process.env.GOOGLE_CLIENT_ID as string,
// //             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
// //         },
// //     },
// //     database: mongodbAdapter(db, {
// //         client,
// //     }),
// // });
// // src/lib/auth.ts
// import { betterAuth } from "better-auth"
// import { MongoClient } from "mongodb"
// import { mongodbAdapter } from "@better-auth/mongo-adapter"
// import { admin } from "better-auth/plugins"

// const uri = process.env.BETTER_AUTH_DB_URI

// if (!uri) {
//     throw new Error("BETTER_AUTH_DB_URI is missing")
// }

// // Reuse the same MongoDB client during Next.js hot reloads.
// const globalForMongo = globalThis as typeof globalThis & {
//     mongoClient?: MongoClient
// }

// const client = globalForMongo.mongoClient ?? new MongoClient(uri)

// if (!globalForMongo.mongoClient) {
//     globalForMongo.mongoClient = client
// }

// const db = client.db("pizzahubdb")

// export const auth = betterAuth({
//     baseURL: process.env.BETTER_AUTH_URL,
//     secret: process.env.BETTER_AUTH_SECRET,

//     database: mongodbAdapter(db, {
//         client,
//     }),

//     emailAndPassword: {
//         enabled: true,
//         minPasswordLength: 6,
//     },

//     //   user: {
//     //     additionalFields: {
//     //       role: {
//     //         type: ["vendor", "customer", "admin"],
//     //         required: false,
//     //         defaultValue: "customer",
//     //         // The sign-up form may send "vendor" or "customer".
//     //         // The hook below makes sure "admin" can never be chosen here.
//     //         input: true,
//     //       },
//     //     },
//     //   },

//     user: {
//         additionalFields: {
//             role: {
//                 type: ["vendor", "customer", "admin"],
//                 required: false,
//                 defaultValue: "customer",
//                 input: true,
//             },
//             status: {
//                 type: ["unblocked", "blocked"],
//                 required: false,
//                 defaultValue: "unblocked",
//                 input: false,
//             },
//         },
//     },


//     plugins: [
//         admin()
//     ],
//     // additionalFields: {
//     //     role: { /* ...keep as it is... */ },
//     //     status: {
//     //         type: ["unblocked", "blocked"],
//     //         required: false,
//     //         defaultValue: "unblocked",
//     //         input: false, // users can never send or change this themselves
//     //     },
//     // },
//     databaseHooks: {
//         user: {
//             create: {
//                 // Runs for every new account, including Google sign-ups.
//                 before: async (newUser) => {
//                     const role = (newUser as { role?: string }).role

//                     return {
//                         data: {
//                             ...newUser,
//                             role: role === "vendor" ? "vendor" : "customer",
//                         },
//                     }
//                 },
//             },
//         },
//     },

//     // Google sign-in is switched on only when both keys exist in .env.
//     // This also removes the "missing clientId or clientSecret" warning.
//     socialProviders:
//         process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
//             ? {
//                 google: {
//                     clientId: process.env.GOOGLE_CLIENT_ID,
//                     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                 },
//             }
//             : {},
// })



import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { admin } from "better-auth/plugins"

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
  // The admin() plugin already declares `role` itself with `input: false`,
  // so a visitor may never send `role` during sign-up (Better Auth answers
  // "role is not allowed to be set"). The sign-up form sends `requestedRole`
  // instead, and the database hook below turns it into a safe role.
  user: {
    additionalFields: {
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

  // Admin plugin (owns the real `role` field)
  plugins: [admin()],

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
