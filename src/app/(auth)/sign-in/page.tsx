
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pizza,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "react-toastify";

const COLORS = {
  cream: "#FFF8EC",
  ink: "#1F2A1F",
  green: "#2F6B3A",
  tomato: "#E8452C",
  cheese: "#FFD66B",
  crust: "#E9A94B",
};

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data,error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if(data){
        toast.success("Sign-in successfully")
      }

      if (error) {
        setError(error.message || "Invalid email or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
const handleGoogleSignIn = async () => {
  setError("");
  setGoogleLoading(true);

  try {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      errorCallbackURL: "/sign-in",
    });

    if (error) {
      console.error("Google authentication error:", error);
      setError(error.message || "Google sign-in failed.");
      setGoogleLoading(false);
      return;
    }

    // Better Auth normally redirects automatically.
    // This handles a returned URL if automatic redirect
    // did not happen.
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }

    setGoogleLoading(false);
    setError("Google authentication did not return a redirect URL.");
  } catch (err) {
    console.error("Google sign-in failed:", err);
    setError("Unable to connect to Google. Please try again.");
    setGoogleLoading(false);
  }
};

  return (
    <main
      className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-5"
      style={{ backgroundColor: COLORS.cream }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        {/* Left Side */}
        <section
          className="relative hidden min-h-155 flex-col justify-between overflow-hidden p-10 lg:flex"
          style={{ backgroundColor: COLORS.green }}
        >
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
            style={{ backgroundColor: COLORS.cheese }}
          />

          <div
            className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full opacity-15"
            style={{ backgroundColor: COLORS.tomato }}
          />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: COLORS.cheese }}
            >
              <Pizza size={27} style={{ color: COLORS.ink }} />
            </div>

            <span className="text-2xl font-black text-white">
              PizzaHub
            </span>
          </Link>

          <div className="relative z-10">
            <div className="mb-6 text-7xl">🍕</div>

            <h1 className="max-w-sm text-4xl leading-tight font-black text-white">
              Welcome back to your pizza paradise!
            </h1>

            <p className="mt-5 max-w-sm text-base leading-7 text-white/80">
              Your favorite pizzas are just a few clicks away.
              Sign in and enjoy something delicious today.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS.cheese }}
              />
              <span className="text-sm text-white/80">
                Freshly made. Always delicious.
              </span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/60">
            © {new Date().getFullYear()} PizzaHub. All rights reserved.
          </p>
        </section>

        {/* Right Side */}
        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="mb-8 flex items-center justify-center gap-2 lg:hidden"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: COLORS.cheese }}
              >
                <Pizza size={25} style={{ color: COLORS.ink }} />
              </div>

              <span
                className="text-2xl font-black"
                style={{ color: COLORS.ink }}
              >
                PizzaHub
              </span>
            </Link>

            <div className="mb-7">
              <p
                className="mb-2 text-sm font-bold uppercase tracking-widest"
                style={{ color: COLORS.tomato }}
              >
                Welcome Back
              </p>

              <h2
                className="text-3xl font-black sm:text-4xl"
                style={{ color: COLORS.ink }}
              >
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your details to continue your delicious journey.
              </p>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: COLORS.ink }}
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                  transform="translate(0 5)"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.44 37.87 46.98 31.73 46.98 24.55Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
                  transform="translate(0 5)"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.91 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                  transform="translate(0 -5)"
                />
              </svg>

              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                  style={{ color: COLORS.ink }}
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition focus:border-green-600 focus:bg-white"
                    style={{ color: COLORS.ink }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: COLORS.ink }}
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-12 pl-11 text-sm outline-none transition focus:border-green-600 focus:bg-white"
                    style={{ color: COLORS.ink }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: COLORS.green }}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-7 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold hover:underline"
                style={{ color: COLORS.tomato }}
              >
                Create an account
              </Link>
            </p>

            <p className="mt-6 text-center text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
