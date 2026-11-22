
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pizza,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

type AccountRole = "customer" | "vendor";

const COLORS = {
  cream: "#FFF8EC",
  ink: "#1F2A1F",
  green: "#2F6B3A",
  tomato: "#E8452C",
  cheese: "#FFD66B",
};

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("customer");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password validation
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase;

  // Name validation
  const validateName = (name: string) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "Full name is required.";
    }

    if (trimmedName.length < 3) {
      return "Name must be at least 3 characters.";
    }

    if (!/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(trimmedName)) {
      return "Please enter a valid name.";
    }

    return "";
  };

  // Email validation
  const validateEmail = (value: string) => {
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // Google sign-up
  const handleGoogleSignUp = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("Google sign-up error:", err);

      toast.error("Google sign-up failed", {
        position: "top-right",
      });

      setGoogleLoading(false);
    }
  };

  // Email sign-up
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const nameValidation = validateName(fullName);
    const emailValidation = validateEmail(email);

    setNameError(nameValidation);
    setEmailError(emailValidation);

    if (nameValidation || emailValidation || !isPasswordValid) {
      const message = !isPasswordValid
        ? "Please meet all password requirements."
        : "Please correct the highlighted fields.";

      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await authClient.signUp.email({
          name: fullName.trim(),
          email: email.trim(),
          password,
          image: profileImageUrl.trim() || undefined,
          // `role` itself is reserved by the admin plugin, so the form asks
          // for a role here and the server hook maps it to the real one.
          requestedRole: role,
        } as Parameters<typeof authClient.signUp.email>[0]);

      if (signUpError) {
        toast.error(
          signUpError.message || "Registration failed. Please try again."
        );
        return;
      }

      if (data) {
        toast.success("Account created successfully!", {
          position: "top-right",
          autoClose: 2500,
        });

        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      console.error("Sign-up error:", err);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen px-3 py-5 sm:px-5"
      style={{ backgroundColor: COLORS.cream }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        newestOnTop
      />

      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">

        {/* Branding Section */}
        <section
          className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden p-9 text-white lg:flex"
          style={{ backgroundColor: COLORS.green }}
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/10" />

          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <Link
            href="/"
            className="relative z-10 flex items-center gap-2"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: COLORS.cheese }}
            >
              <Pizza size={24} style={{ color: COLORS.ink }} />
            </div>

            <span className="text-xl font-black">
              PizzaHub
            </span>
          </Link>

          <div className="relative z-10 max-w-sm">
            <span
              className="mb-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold"
              style={{
                backgroundColor: COLORS.cheese,
                color: COLORS.ink,
              }}
            >
              Welcome to PizzaHub
            </span>

            <h1 className="text-4xl font-black leading-tight">
              Your pizza journey starts here.
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/80">
              Discover delicious pizzas, explore amazing restaurants,
              and enjoy your favorite food with PizzaHub.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-300">
                  🍕
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-yellow-300">
                  🍔
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-300">
                  🍟
                </div>
              </div>

              <p className="text-xs text-white/80">
                Great food. Great moments.
              </p>
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/60">
            © 2026 PizzaHub. All rights reserved.
          </p>
        </section>

        {/* Form Section */}
        <section className="flex flex-col justify-center px-4 py-6 sm:px-8 lg:px-9">

          {/* Mobile Logo */}
          <Link
            href="/"
            className="mb-5 flex items-center gap-2 lg:hidden"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: COLORS.green }}
            >
              <Pizza size={22} color="white" />
            </div>

            <span
              className="text-xl font-black"
              style={{ color: COLORS.ink }}
            >
              PizzaHub
            </span>
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-5">
              <h2
                className="text-2xl font-black sm:text-3xl"
                style={{ color: COLORS.ink }}
              >
                Create your account
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Join PizzaHub and enjoy something delicious.
              </p>
            </div>

            <Card className="border-0 bg-white shadow-none">
              <CardContent className="p-0">

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="ml-3" htmlFor="fullName">
                      Full Name
                    </Label>

                    <div className="relative mx-auto w-[95%]">
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setNameError(validateName(e.target.value));
                        }}
                        onBlur={() => setNameError(validateName(fullName))}
                        placeholder="Enter your full name"
                        className={`h-11 pl-10 ${
                          nameError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        aria-invalid={!!nameError}
                        required
                      />
                    </div>

                    {nameError && (
                      <p className="mx-auto w-[95%] text-xs text-red-500">
                        {nameError}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="ml-3" htmlFor="email">
                      Email Address
                    </Label>

                    <div className="relative mx-auto w-[95%]">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(validateEmail(e.target.value));
                        }}
                        onBlur={() => setEmailError(validateEmail(email))}
                        placeholder="example@email.com"
                        className={`h-11 pl-10 ${
                          emailError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        aria-invalid={!!emailError}
                        required
                      />
                    </div>

                    {emailError && (
                      <p className="mx-auto w-[95%] text-xs text-red-500">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="ml-3" htmlFor="password">
                      Password
                    </Label>

                    <div className="relative mx-auto w-[95%]">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="h-11 pl-10 pr-10"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {/* Password Rules */}
                    <div className="mx-auto flex w-[95%] flex-wrap gap-x-3 gap-y-1 pt-1">
                      {[
                        {
                          valid: hasMinLength,
                          label: "6+ characters",
                        },
                        {
                          valid: hasUppercase,
                          label: "Uppercase",
                        },
                        {
                          valid: hasLowercase,
                          label: "Lowercase",
                        },
                      ].map((rule) => (
                        <div
                          key={rule.label}
                          className="flex items-center gap-1 text-[11px]"
                        >
                          <CheckCircle2
                            size={13}
                            className={
                              rule.valid
                                ? "text-green-600"
                                : "text-gray-300"
                            }
                          />

                          <span
                            className={
                              rule.valid
                                ? "text-green-700"
                                : "text-muted-foreground"
                            }
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="space-y-2">
                    <Label className="ml-3" htmlFor="profileImage">
                      Profile Image{" "}
                      <span className="font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </Label>

                    <div className="mx-auto w-[95%]">
                      <Input
                        id="profileImage"
                        type="url"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        placeholder="https://example.com/profile.jpg"
                        className="h-11"
                      />
                    </div>

                    {profileImageUrl.trim() && (
                      <div className="mx-auto flex w-[95%] items-center gap-3 pt-1">
                        <img
                          src={profileImageUrl}
                          alt="Profile preview"
                          className="size-12 rounded-full border object-cover"
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                          onLoad={(e) => {
                            e.currentTarget.style.visibility = "visible";
                          }}
                        />

                        <span className="text-xs text-muted-foreground">
                          Profile image preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Account Role */}
                  <div className="space-y-2">
                    <Label className="ml-3">
                      Choose Account Role
                    </Label>

                    <RadioGroup
                      value={role}
                      onValueChange={(value) =>
                        setRole(value as AccountRole)
                      }
                      className="mx-auto grid w-[95%] grid-cols-2 gap-3"
                    >
                      <Label
                        htmlFor="customer"
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition ${
                          role === "customer"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem
                          value="customer"
                          id="customer"
                        />

                        <ShoppingBag
                          size={16}
                          style={{ color: COLORS.green }}
                        />

                        <div>
                          <p className="text-sm font-bold">Customer</p>
                          <p className="text-[10px] text-muted-foreground">
                            Order food
                          </p>
                        </div>
                      </Label>

                      <Label
                        htmlFor="vendor"
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition ${
                          role === "vendor"
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem
                          value="vendor"
                          id="vendor"
                        />

                        <Store
                          size={16}
                          style={{ color: COLORS.green }}
                        />

                        <div>
                          <p className="text-sm font-bold">Vendor</p>
                          <p className="text-[10px] text-muted-foreground">
                            Restaurant owner
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="h-11 w-full gap-2 font-bold text-white hover:opacity-90"
                    style={{ backgroundColor: COLORS.green }}
                  >
                    {loading ? "Creating Account..." : "Create Account"}

                    {!loading && <ArrowRight size={17} />}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-4 flex items-center gap-3">
                  <Separator className="flex-1" />

                  <span className="text-xs text-muted-foreground">
                    Or sign up with
                  </span>

                  <Separator className="flex-1" />
                </div>

                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || loading}
                  className="h-11 w-full gap-2"
                >
                  {googleLoading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                  ) : (
                    <svg
                      viewBox="0 0 48 48"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.47 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.66 5.94c4.47-4.13 7.11-10.2 7.11-17.59z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.04 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.48-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.9-5.86l-7.66-5.94c-2.13 1.43-4.86 2.28-8.24 2.28-6.53 0-12.07-4.22-14.05-9.91l-7.48 6.19C6.51 43.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}

                  {googleLoading
                    ? "Connecting to Google..."
                    : "Continue with Google"}
                </Button>
              </CardContent>
            </Card>

            {/* Sign In */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}

              <Link
                href="/sign-in"
                className="font-bold hover:underline"
                style={{ color: COLORS.green }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
