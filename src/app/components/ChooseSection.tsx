"use client"

import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import {
  ArrowRight,
  Bike,
  ClipboardCheck,
  Search,
  ShoppingBag,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import {
  easeOut,
  fadeUp,
  pop,
  stagger,
  viewport,
} from "@/lib/motion-variants"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const steps = [
  {
    title: "Browse the menu",
    blurb: "Explore the categories and find what you are craving.",
    icon: Search,
  },
  {
    title: "Add to your cart",
    blurb: "Pick your favorite pizzas, sides and drinks.",
    icon: ShoppingBag,
  },
  {
    title: "Place your order",
    blurb: "Confirm your details and order in a few taps.",
    icon: ClipboardCheck,
  },
  {
    title: "Enjoy it hot",
    blurb: "Your food arrives in about 30 minutes, fresh and hot.",
    icon: Bike,
  },
]

const ChooseSection = () => {
  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="how-heading"
        className="bg-[#FFF8EC] px-3 py-10 sm:px-4 sm:py-14"
      >
        {/* Banner panel (same width as the hero and category banners) */}
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#D63A22_0%,#E8452C_50%,#F2751A_100%)] px-6 py-14 shadow-xl sm:px-12 sm:py-20">
          {/* Soft decorative circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[40px] border-white/10"
          />

          <div className="relative mx-auto max-w-5xl">
            <motion.header
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mx-auto mb-14 max-w-xl text-center"
            >
              <motion.p
                variants={fadeUp}
                className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-[#FFF1CC]"
              >
                Simple as 1, 2, 3, 4
              </motion.p>
              <motion.h2
                variants={fadeUp}
                id="how-heading"
                className={`${display.className} text-4xl font-extrabold tracking-tight text-[#FFF8EC] sm:text-5xl`}
              >
                How PizzaHub works
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-base font-medium text-[#FFF8EC]/90"
              >
                From craving to first bite in four easy steps.
              </motion.p>
            </motion.header>

            <div className="relative">
              {/* Dotted path joining the steps (large screens). It draws itself in. */}
              <motion.div
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={viewport}
                transition={{ duration: 1.1, delay: 0.3, ease: easeOut }}
                style={{ originX: 0 }}
                className="absolute left-[12.5%] right-[12.5%] top-10 hidden border-t-2 border-dashed border-white/60 lg:block"
              />

              <motion.ol
                variants={stagger(0.18)}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                className="relative grid gap-10 lg:grid-cols-4 lg:gap-6"
              >
                {steps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <motion.li
                      key={step.title}
                      variants={fadeUp}
                      className="flex items-start gap-5 lg:flex-col lg:items-center lg:text-center"
                    >
                      <motion.span
                        variants={pop}
                        className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#FFF8EC] shadow-lg ring-8 ring-white/20"
                      >
                        <Icon
                          className="h-8 w-8 text-[#E8452C]"
                          aria-hidden="true"
                        />
                      </motion.span>

                      <div className="lg:mt-2">
                        <p className="text-sm font-bold text-[#FFE3A3]">
                          Step {i + 1}
                        </p>
                        <h3
                          className={`${display.className} mt-1 text-xl font-extrabold text-[#FFF8EC]`}
                        >
                          {step.title}
                        </h3>
                        <p className="mt-2 text-base font-medium text-[#FFF8EC]/90">
                          {step.blurb}
                        </p>
                      </div>
                    </motion.li>
                  )
                })}
              </motion.ol>
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mt-14 text-center"
            >
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFF8EC] px-8 py-3.5 text-base font-bold text-[#C2331B] shadow-lg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Start your order
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </motion.span>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default ChooseSection