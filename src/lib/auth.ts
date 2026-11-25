
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

// ---------- Environment Variables ----------
const uri = process.env.BETTER_AUTH_DB_URI;

if (!uri) {
  throw new Error("BETTER_AUTH_DB_URI is missing");
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL is missing");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is missing");
}

// ---------- MongoDB Connection ----------
const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ?? new MongoClient(uri);

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client;
}

const db = client.db("pizzahubdb");

// ---------- Trusted Origins ----------
const trustedOrigins = [
  "http://localhost:3000",
  "https://pizzahub-client-liart-gamma.vercel.app",
];

// ---------- Better Auth ----------
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins,

  database: mongodbAdapter(db, {
    client,
  }),

  // ---------- Email & Password ----------
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  // ---------- Google Authentication ----------
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // ---------- Custom User Fields ----------
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

  // ---------- Server-side password policy ----------
  // The sign-up form checks this too, but the rule has to hold even when the
  // request does not come from our UI.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const body = ctx.body as { password?: unknown } | undefined;
      const password = body?.password;

      if (typeof password !== "string") return;

      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password must include at least one uppercase and one lowercase letter.",
        });
      }
    }),
  },

  // ---------- Database Hooks ----------
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const {
            requestedRole,
            ...rest
          } = newUser as {
            requestedRole?: string;
          } & Record<string, unknown>;

          return {
            data: {
              ...rest,
              role:
                requestedRole === "vendor"
                  ? "vendor"
                  : "customer",
              status: "unblocked",
            },
          };
        },
      },
    },
  },
});
