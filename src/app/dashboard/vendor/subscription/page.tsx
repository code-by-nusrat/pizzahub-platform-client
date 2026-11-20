
"use client"

import { useState } from "react"
import {
  Check,
  Crown,
  Zap,
  Package,
  LayoutDashboard,
  ShoppingBag,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const freeFeatures = [
  "Up to 3 active menu items",
  "Basic vendor dashboard",
  "Order management",
]

const premiumFeatures = [
  "Unlimited active menu items",
  "Premium vendor badge",
  "Featured menu placement",
  "Basic vendor dashboard",
  "Order management",
]

const comparison = [
  {
    feature: "Active menu items",
    free: "Up to 3",
    premium: "Unlimited",
  },
  {
    feature: "Vendor dashboard",
    free: "Basic",
    premium: "Basic",
  },
  {
    feature: "Order management",
    free: true,
    premium: true,
  },
  {
    feature: "Premium vendor badge",
    free: false,
    premium: true,
  },
  {
    feature: "Featured menu placement",
    free: false,
    premium: true,
  },
]

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("free")
  const [message, setMessage] = useState("")

  const handleSubscribe = (plan: "free" | "premium") => {
    setSelectedPlan(plan)

    if (plan === "free") {
      setMessage("You selected the Free plan.")
    } else {
      setMessage(
        "Premium selected! Connect your subscription payment system to activate this plan."
      )
    }

    setTimeout(() => setMessage(""), 4000)
  }

  return (
    <main className="min-h-screen bg-[#FFF8EC] px-4 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 border border-[#E8452C]/20 bg-[#E8452C]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E8452C]">
            <Sparkles size={15} />
            Vendor Membership
          </span>

          <h1
            className={`${display.className} mt-5 text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-5xl`}
          >
            Grow your business.
            <br />
            <span className="text-[#E8452C]">
              Choose your plan.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#7A6258] sm:text-base">
            Whether you're just getting started or ready to grow,
            PizzaHub has the right membership to help your restaurant
            reach more hungry customers.
          </p>
        </div>

        {/* Success / Info Message */}
        {message && (
          <div
            role="status"
            className="mx-auto mb-8 max-w-lg border border-[#3D8545]/20 bg-[#EAF4E8] p-4 text-center text-sm font-semibold text-[#386C3E]"
          >
            {message}
          </div>
        )}

        {/* Plan Cards */}
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-2">

          {/* Free Plan */}
          <section className="relative flex flex-col border border-[#2B1B14]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex h-14 w-14 items-center justify-center bg-[#FFF0E3] text-[#E8452C]">
              <Package size={27} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A6258]">
              Get started
            </p>

            <h2
              className={`${display.className} mt-2 text-3xl font-extrabold text-[#2B1B14]`}
            >
              Free
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A6258]">
              Everything you need to start managing your food business.
            </p>

            <div className="my-7 border-b border-[#2B1B14]/10 pb-7">
              <span className={`${display.className} text-4xl font-extrabold text-[#2B1B14]`}>
                ৳0
              </span>
              <span className="ml-2 text-sm text-[#7A6258]">
                / forever
              </span>
            </div>

            <p className="mb-5 text-sm font-bold text-[#2B1B14]">
              What's included:
            </p>

            <ul className="flex-1 space-y-4">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF4E8] text-[#3D8545]">
                    <Check size={13} />
                  </span>
                  <span className="text-sm text-[#7A6258]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe("free")}
              className="mt-9 flex h-12 w-full items-center justify-center gap-2 border border-[#2B1B14] text-sm font-bold uppercase tracking-wider text-[#2B1B14] transition hover:bg-[#2B1B14] hover:text-white"
            >
              Choose Free
              <ArrowRight size={17} />
            </button>
          </section>

          {/* Premium Plan */}
          <section className="relative flex flex-col overflow-hidden border-2 border-[#E8452C] bg-white p-6 shadow-xl shadow-[#E8452C]/10 sm:p-8">

            {/* Popular Label */}
            <div className="absolute right-0 top-0 flex items-center gap-1 bg-[#E8452C] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white">
              <Star size={12} fill="currentColor" />
              Recommended
            </div>

            <div className="mb-6 flex h-14 w-14 items-center justify-center bg-[#E8452C] text-white">
              <Crown size={27} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8452C]">
              Grow faster
            </p>

            <h2
              className={`${display.className} mt-2 text-3xl font-extrabold text-[#2B1B14]`}
            >
              Premium
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A6258]">
              Unlock more visibility and unlimited possibilities for your restaurant.
            </p>

            <div className="my-7 border-b border-[#2B1B14]/10 pb-7">
              <span className={`${display.className} text-4xl font-extrabold text-[#E8452C]`}>
                Custom
              </span>
              <p className="mt-1 text-xs text-[#7A6258]">
                Subscription price to be configured
              </p>
            </div>

            <p className="mb-5 text-sm font-bold text-[#2B1B14]">
              Everything in Free, plus:
            </p>

            <ul className="flex-1 space-y-4">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF0E3] text-[#E8452C]">
                    <Check size={13} />
                  </span>
                  <span className="text-sm text-[#7A6258]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe("premium")}
              className="group mt-9 flex h-12 w-full items-center justify-center gap-2 bg-[#E8452C] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#C2331B]"
            >
              Get Premium
              <Zap size={17} />
            </button>
          </section>
        </div>

        {/* Feature Comparison */}
        <section className="mx-auto mt-16 max-w-4xl">
          <div className="mb-7 text-center">
            <h2
              className={`${display.className} text-2xl font-extrabold text-[#2B1B14] sm:text-3xl`}
            >
              Compare plans
            </h2>

            <p className="mt-2 text-sm text-[#7A6258]">
              Find the right features for your restaurant.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#2B1B14]/10 bg-white">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="bg-[#2B1B14] text-white">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 text-[#FFB18D]">
                      <Crown size={14} />
                      Premium
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparison.map((item, index) => (
                  <tr
                    key={item.feature}
                    className={index % 2 === 0 ? "bg-[#FFF8EC]" : "bg-white"}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-[#2B1B14]">
                      {item.feature}
                    </td>

                    <td className="px-5 py-4 text-center text-sm text-[#7A6258]">
                      {typeof item.free === "boolean" ? (
                        item.free ? (
                          <Check className="mx-auto text-[#3D8545]" size={19} />
                        ) : (
                          <span className="text-[#C9BDB3]">—</span>
                        )
                      ) : (
                        item.free
                      )}
                    </td>

                    <td className="px-5 py-4 text-center text-sm font-semibold text-[#E8452C]">
                      {typeof item.premium === "boolean" ? (
                        item.premium ? (
                          <Check className="mx-auto text-[#3D8545]" size={19} />
                        ) : (
                          <span className="text-[#C9BDB3]">—</span>
                        )
                      ) : (
                        item.premium
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Information */}
        <section className="mt-12 border border-[#2B1B14]/10 bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#EAF4E8] text-[#3D8545]">
              <ShieldCheck size={28} />
            </div>

            <div className="flex-1">
              <h3
                className={`${display.className} text-lg font-bold text-[#2B1B14]`}
              >
                Simple and flexible membership
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#7A6258]">
                Start with our Free plan and explore PizzaHub.
                Upgrade to Premium whenever you're ready to grow your business.
              </p>
            </div>

            <BadgeCheck
              size={30}
              className="hidden shrink-0 text-[#E8452C] sm:block"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className={`${display.className} text-sm font-bold text-[#2B1B14]`}>
            Good food. Good mood.{" "}
            <span className="text-[#E8452C]">PizzaHub.</span>
          </p>

          <p className="mt-1 text-xs text-[#7A6258]">
            Helping local food businesses grow.
          </p>
        </div>
      </div>
    </main>
  )
}

export default SubscriptionPage
