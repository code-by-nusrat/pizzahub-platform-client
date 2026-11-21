"use client"

import {
    ArrowRight,
    BadgeCheck,
    Check,
    Crown,
    Package,
    Sparkles,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const PREMIUM_PRICE = 5 // US dollars per month

const FREE_FEATURES = [
    "Up to 3 active menu items",
    "Basic vendor dashboard",
    "Order management",
]

const PREMIUM_FEATURES = [
    "Unlimited active menu items",
    "Premium vendor badge",
    "Featured menu placement",
    "Everything in Free",
]

type SearchParams = Record<string, string | string[] | undefined>

export default function SubscriptionPlans({
    currentPlan = "free",
    isVendor = true,
    searchParams,
}: {
    currentPlan?: "free" | "premium"
    // Only vendor accounts may check out. Customers and admins see a disabled
    // button instead of a payment form.
    isVendor?: boolean
    // The page passes the URL params in. Read them here when you need them,
    // e.g. searchParams?.success after a Stripe checkout.
    searchParams?: SearchParams
}) {
    const isPremium = currentPlan === "premium"
    const canUpgrade = isVendor && !isPremium

    const checkoutError =
        typeof searchParams?.error === "string" ? searchParams.error : ""
    const checkoutNotice =
        checkoutError === "already-premium"
            ? "You are already on Premium — no new checkout is needed."
            : checkoutError === "plan"
              ? "We could not confirm your current plan. Please try again."
              : ""

    return (
        <section className="min-h-screen bg-[#FFF8EC] px-4 py-14 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-5xl">
                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-2 border border-[#2B1B14]/15 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#7A6258]">
                        <Sparkles className="h-3.5 w-3.5 text-[#E8452C]" />
                        Vendor plans
                    </span>

                    <h1
                        className={`${display.className} mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2B1B14] sm:text-6xl`}
                    >
                        Pick the plan that
                        <br />
                        <span className="text-[#E8452C]">grows your kitchen.</span>
                    </h1>

                    <p className="mt-5 text-[#7A6258]">
                        Start free. Upgrade when you are ready for more dishes, more
                        visibility and more orders.
                    </p>
                </div>

                {/* Plans */}
                <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2 md:gap-0">
                    {/* ---------- Free ---------- */}
                    <article className="flex flex-col border border-[#2B1B14]/10 bg-white p-7 sm:p-9 md:border-r-0">
                        <div className="flex items-center justify-between">
                            <span className="flex h-12 w-12 items-center justify-center bg-[#FFF0E3] text-[#E8452C]">
                                <Package className="h-6 w-6" />
                            </span>
                            {!isPremium && (
                                <span className="bg-[#EAF4E8] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3D8545]">
                                    Your plan
                                </span>
                            )}
                        </div>

                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#7A6258]">
                            Get started
                        </p>
                        <h2
                            className={`${display.className} mt-1 text-3xl font-extrabold text-[#2B1B14]`}
                        >
                            Free
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#7A6258]">
                            Everything you need to start managing your food business.
                        </p>

                        <p className="mt-7 flex items-end gap-2">
                            <span
                                className={`${display.className} text-6xl font-extrabold leading-none text-[#2B1B14]`}
                            >
                                $0
                            </span>
                            <span className="pb-1.5 text-sm text-[#7A6258]">/ forever</span>
                        </p>

                        <ul className="mt-8 flex-1 space-y-3.5 border-t border-[#2B1B14]/10 pt-7">
                            {FREE_FEATURES.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-3 text-sm text-[#2B1B14]"
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4E8] text-[#3D8545]">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            disabled
                            className="mt-9 h-12 w-full border border-[#2B1B14]/20 text-sm font-bold uppercase tracking-wider text-[#7A6258] disabled:cursor-not-allowed"
                        >
                            {isPremium ? "Included" : "Current plan"}
                        </button>
                    </article>

                    {/* ---------- Premium ---------- */}
                    <article className="relative flex flex-col overflow-hidden bg-[#2B1B14] p-7 text-[#FFF8EC] shadow-[0_30px_70px_-25px_rgba(232,69,44,0.55)] sm:p-9 md:-my-4 md:py-13">
                        {/* Glow */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#E8452C]/30 blur-3xl"
                        />

                        {/* Ribbon */}
                        <div className="absolute right-0 top-0 flex items-center gap-1.5 bg-[#E8452C] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Recommended
                        </div>

                        <div className="relative flex flex-1 flex-col">
                            <span className="flex h-12 w-12 items-center justify-center bg-[#E8452C] text-white">
                                <Crown className="h-6 w-6" />
                            </span>

                            <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#F2751A]">
                                Grow faster
                            </p>
                            <h2
                                className={`${display.className} mt-1 text-3xl font-extrabold`}
                            >
                                Premium
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-[#FFF8EC]/70">
                                Unlock more visibility and unlimited possibilities for your
                                restaurant.
                            </p>

                            <p className="mt-7 flex items-end gap-2">
                                <span
                                    className={`${display.className} text-6xl font-extrabold leading-none text-[#F2751A]`}
                                >
                                    ${PREMIUM_PRICE}
                                </span>
                                <span className="pb-1.5 text-sm text-[#FFF8EC]/70">/ month</span>
                            </p>
                            <p className="mt-2 text-xs text-[#FFF8EC]/55">
                                Billed monthly. Cancel anytime.
                            </p>

                            <ul className="mt-8 flex-1 space-y-3.5 border-t border-[#FFF8EC]/15 pt-7">
                                {PREMIUM_FEATURES.map((feature, index) => (
                                    <li
                                        key={feature}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8452C] text-white">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                        <span
                                            className={
                                                index === PREMIUM_FEATURES.length - 1
                                                    ? "text-[#FFF8EC]/70"
                                                    : "font-semibold"
                                            }
                                        >
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Posts to /api/checkout_sessions, which sends the vendor to Stripe */}
                            {canUpgrade ? (
                                <form action="/api/checkout_sessions" method="POST">
                                    <button
                                        type="submit"
                                        className="group mt-9 flex h-12 w-full items-center justify-center gap-3 bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2751A]"
                                    >
                                        Upgrade to Premium
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="mt-9 flex h-12 w-full items-center justify-center gap-3 bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isPremium ? "Your current plan" : "Vendor accounts only"}
                                </button>
                            )}

                            {!isVendor && (
                                <p className="mt-3 text-center text-xs text-[#FFF8EC]/60">
                                    Sign in with a vendor account to subscribe.
                                </p>
                            )}
                        </div>
                    </article>
                </div>

                <p
                    className={`${display.className} mt-12 text-center text-sm font-bold text-[#2B1B14]`}
                >
                    Good food. Good mood.{" "}
                    <span className="text-[#E8452C]">PizzaHub.</span>
                </p>
            </div>
        </section>
    )
}