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


import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const uri = process.env.BETTER_AUTH_DB_URI;

if (!uri) {
  throw new Error("BETTER_AUTH_DB_URI is missing");
}

// Reuse the same MongoDB client during Next.js hot reloads.
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(uri);

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client;
}

const db = client.db("pizzahubdb");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: ['vendor','customer','admin'],
        required: false,
        
        input: true,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
