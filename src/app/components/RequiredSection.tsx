"use client"

import { useEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useReducedMotion,
} from "motion/react"
import { Clock, Leaf, MapPin, Pizza, Star } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

import {
  easeOut,
  fadeUp,
  stagger,
  viewport,
} from "@/lib/motion-variants"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const tile =
  "group relative overflow-hidden rounded-3xl p-6 transition-shadow duration-300 hover:shadow-xl sm:p-8"

// Counts up to a number when it scrolls into view.
// Screen readers read the final value; reduced-motion users see it right away.
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, viewport)
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return

    const controls = animate(0, to, {
      duration: 1.4,
      ease: easeOut,
      onUpdate: (latest) => setValue(latest),
    })

    return () => controls.stop()
  }, [inView, reduce, to])

  const shown = reduce ? to : value

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{to.toFixed(decimals)}</span>
      <span aria-hidden="true">{shown.toFixed(decimals)}</span>
    </span>
  )
}

const RequiredSection = () => {
  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="why-heading"
        className=" px-4 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <motion.header
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="mb-12 max-w-xl"
          >
            <motion.p
              variants={fadeUp}
              className="mb-3 inline-block rounded-full bg-[#2F6B3A]/10 px-3 py-1 text-sm font-medium text-[#2F6B3A]"
            >
              Why PizzaHub
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="why-heading"
              className={`${display.className} text-4xl font-extrabold tracking-tight text-[#1F2A1F] sm:text-5xl`}
            >
              Why choose PizzaHub?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-base text-[#1F2A1F]/70"
            >
              Great pizza is only part of it. Here is what you get every time
              you order.
            </motion.p>
          </motion.header>

          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Fast delivery (large tile) */}
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${tile} flex min-h-[280px] flex-col justify-between bg-[linear-gradient(135deg,#D63A22_0%,#E8631A_100%)] text-[#FFF8EC] sm:col-span-2 lg:col-span-2`}
            >
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full border-[32px] border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-white/10"
              />

              <Clock className="relative h-8 w-8" aria-hidden="true" />

              <div className="relative mt-10">
                <p
                  className={`${display.className} text-7xl font-extrabold leading-none sm:text-8xl`}
                >
                  <CountUp to={30} />
                  <span className="ml-2 text-2xl font-bold sm:text-3xl">
                    min
                  </span>
                </p>
                <h3
                  className={`${display.className} mt-4 text-2xl font-extrabold`}
                >
                  Hot at your door
                </h3>
                <p className="mt-2 max-w-md text-base font-medium">
                  Your pizza arrives in about 30 minutes, fresh from the oven
                  and still steaming.
                </p>
              </div>
            </motion.article>

            {/* Fresh ingredients */}
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${tile} bg-white text-[#1F2A1F] shadow-sm`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2F6B3A]">
                <Leaf className="h-7 w-7 text-white" aria-hidden="true" />
              </span>
              <h3
                className={`${display.className} mt-8 text-2xl font-extrabold`}
              >
                Fresh ingredients
              </h3>
              <p className="mt-2 text-base text-[#1F2A1F]/70">
                From the dough to the toppings, every pizza is made with fresh
                ingredients.
              </p>
            </motion.article>

            {/* Rating */}
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${tile} bg-[#FFC857] text-[#1F2A1F]`}
            >
              <p
                className={`${display.className} text-7xl font-extrabold leading-none`}
              >
                <CountUp to={4.9} decimals={1} />
              </p>
              <div
                className="mt-3 flex gap-1"
                role="img"
                aria-label="Rated 4.9 out of 5"
              >
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 fill-[#1F2A1F] text-[#1F2A1F]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <h3
                className={`${display.className} mt-6 text-2xl font-extrabold`}
              >
                Loved by pizza fans
              </h3>
              <p className="mt-2 text-base font-medium text-[#1F2A1F]/80">
                Customers rate their orders 4.9 out of 5.
              </p>
            </motion.article>

            {/* Local kitchens */}
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${tile} bg-[#2F6B3A] text-[#FFF8EC]`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF8EC]">
                <MapPin className="h-7 w-7 text-[#2F6B3A]" aria-hidden="true" />
              </span>
              <h3
                className={`${display.className} mt-8 text-2xl font-extrabold`}
              >
                Local kitchens
              </h3>
              <p className="mt-2 text-base text-[#FFF8EC]/85">
                Order from kitchens across Dhaka, from Gulshan to Mirpur, close
                to where you are.
              </p>
            </motion.article>

            {/* Variety */}
            <motion.article
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`${tile} bg-[#1F2A1F] text-[#FFF8EC] sm:col-span-2 lg:col-span-1`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8452C]">
                <Pizza className="h-7 w-7 text-white" aria-hidden="true" />
              </span>
              <h3
                className={`${display.className} mt-8 text-2xl font-extrabold`}
              >
                Something for everyone
              </h3>
              <p className="mt-2 text-base text-[#FFF8EC]/80">
                Classic, vegetarian, meat lovers and spicy pizzas, plus sides
                and drinks.
              </p>
            </motion.article>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default RequiredSection