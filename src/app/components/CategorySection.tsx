"use client"

import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"
import type { CSSProperties } from "react"

import {
  easeOut,
  fadeUp,
  slideIn,
  stagger,
  viewport,
} from "@/lib/motion-variants"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// `label` is what customers see.
// `query` must match the category saved on your menu items, because
// the browse page filters by it (for example /browse-menu?category=Pizza).
const categories = [
  {
    label: "Pizza",
    query: "Pizza",
    emoji: "🍕",
    blurb: "Stone-baked pies with your favourite toppings.",
    color: "#E8452C",
  },
  {
    label: "Burgers",
    query: "Burger",
    emoji: "🍔",
    blurb: "Stacked patties, fresh buns and crunchy veg.",
    color: "#B8401F",
  },
  {
    label: "Pasta",
    query: "Pasta",
    emoji: "🍝",
    blurb: "Creamy, saucy bowls made to order.",
    color: "#E9A92B",
  },
  {
    label: "Sides",
    query: "Sides",
    emoji: "🍟",
    blurb: "Crispy starters to share while you wait.",
    color: "#6FAF4B",
  },
  {
    label: "Desserts",
    query: "Dessert",
    emoji: "🍰",
    blurb: "Sweet finishes to round off your meal.",
    color: "#F2751A",
  },
  {
    label: "Drinks",
    query: "Drinks",
    emoji: "🥤",
    blurb: "Cold drinks and refreshing sips.",
    color: "#8A5530",
  },
]

// ---------- pizza wheel geometry ----------
const CX = 200
const CY = 200
const RADIUS = 172
const GAP = 3 // degrees between slices
const PULL = 14 // how far a slice moves out on hover

const round = (n: number) => Math.round(n * 100) / 100

function point(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return {
    x: round(CX + radius * Math.cos(rad)),
    y: round(CY + radius * Math.sin(rad)),
  }
}

const slices = categories.map((category, i) => {
  const span = 360 / categories.length
  const start = -90 + i * span + GAP / 2
  const end = start + span - GAP
  const mid = start + (span - GAP) / 2

  const from = point(start, RADIUS)
  const to = point(end, RADIUS)
  const label = point(mid, RADIUS * 0.62)
  const rad = (mid * Math.PI) / 180

  return {
    ...category,
    path: `M ${CX} ${CY} L ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 0 1 ${to.x} ${to.y} Z`,
    labelX: label.x,
    labelY: label.y,
    pullX: round(Math.cos(rad) * PULL),
    pullY: round(Math.sin(rad) * PULL),
  }
})

const hrefFor = (query: string) =>
  `/browse-menu?category=${encodeURIComponent(query)}`

const CategorySection = () => {
  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="category-heading"
        className=" px-3 py-10 sm:px-4 sm:py-14 mt-10"
      >
        {/* Full-width banner panel (same width as the hero banner) */}
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1F4D2A_0%,#2F6B3A_55%,#3C8248_100%)] px-6 py-14 shadow-xl sm:px-12 sm:py-20">
          {/* Warm glow behind the pizza */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_27%_68%,rgba(242,117,26,0.4),transparent_52%)]"
          />

          {/* Content (same width as the hero text and navbar) */}
          <div className="relative mx-auto max-w-5xl">
            <motion.header
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="mb-12 max-w-xl"
            >
              <motion.p
                variants={fadeUp}
                className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-[#FFE3A3]"
              >
                Explore the menu
              </motion.p>
              <motion.h2
                variants={fadeUp}
                id="category-heading"
                className={`${display.className} text-4xl font-extrabold tracking-tight text-[#FFF8EC] sm:text-5xl`}
              >
                Pick your slice
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-base text-[#FFF8EC]/80"
              >
                Six ways to order. Tap a slice of the pizza or choose from the
                list.
              </motion.p>
            </motion.header>

            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Pizza wheel: turns into place as it appears. Each slice is a shortcut. */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88, rotate: -12 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={viewport}
                transition={{ duration: 0.9, ease: easeOut }}
              >
                <svg
                  viewBox="0 0 400 400"
                  aria-hidden="true"
                  className="mx-auto w-full max-w-sm drop-shadow-2xl sm:max-w-md"
                >
                  {/* Crust and cheese base */}
                  <circle cx={CX} cy={CY} r={192} fill="#E3A957" />
                  <circle cx={CX} cy={CY} r={182} fill="#F6D58E" />

                  {slices.map((slice) => (
                    <Link
                      key={slice.query}
                      href={hrefFor(slice.query)}
                      tabIndex={-1}
                      className="cursor-pointer transition-transform duration-300 ease-out hover:[transform:translate(var(--pull-x),var(--pull-y))] motion-reduce:transition-none"
                      style={
                        {
                          "--pull-x": `${slice.pullX}px`,
                          "--pull-y": `${slice.pullY}px`,
                        } as CSSProperties
                      }
                    >
                      <path
                        d={slice.path}
                        fill={slice.color}
                        stroke="#FFF8EC"
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        fontSize={44}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {slice.emoji}
                      </text>
                    </Link>
                  ))}

                  {/* Center */}
                  <circle cx={CX} cy={CY} r={30} fill="#FFF8EC" />
                  <text
                    x={CX}
                    y={CY}
                    fontSize={13}
                    fontWeight={800}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#1F2A1F"
                    letterSpacing={1}
                  >
                    MENU
                  </text>
                </svg>
              </motion.div>

              {/* Category list: rows slide in one after another */}
              <motion.ul
                variants={stagger(0.08, 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                className="divide-y divide-white/15 border-y border-white/15"
              >
                {categories.map((category, i) => (
                  <motion.li key={category.query} variants={slideIn}>
                    <Link
                      href={hrefFor(category.query)}
                      className="group flex items-center gap-4 px-2 py-4 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFC857] sm:gap-5 sm:px-4"
                    >
                      <span className="w-7 shrink-0 text-sm font-bold text-[#FFC857]">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.emoji}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`${display.className} block text-lg font-extrabold text-[#FFF8EC]`}
                        >
                          {category.label}
                        </span>
                        <span className="block text-sm text-[#FFF8EC]/75">
                          {category.blurb}
                        </span>
                      </span>

                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-[#FFF8EC]/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FFC857]"
                      />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}

export default CategorySection