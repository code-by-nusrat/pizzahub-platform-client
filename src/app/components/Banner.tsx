"use client"

// PizzaHub Hero Banner
// Built with shadcn/ui (Button) and lucide-react icons.
// Matches the colors of the "Navbar2" floating pill navbar.
//
// Setup (run once in your project, skip what you already have):
//   npx shadcn@latest add button
//   npm install lucide-react
//
// Then use it under your navbar:  <Hero />

import { ArrowRight, Clock, Leaf, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// 1) Colors. Change them here and the whole banner updates.
const COLORS = {
    cream: "#FFF8EC",
    ink: "#1F2A1F",
    green: "#2F6B3A",
    tomato: "#E8452C",
    cheese: "#FFD66B",
    crust: "#E9A94B",
}

// 2) Pepperoni positions on the pizza illustration (x, y, size).
const pepperoni = [
    { x: 200, y: 105, r: 20 },
    { x: 275, y: 150, r: 18 },
    { x: 290, y: 225, r: 21 },
    { x: 240, y: 290, r: 19 },
    { x: 160, y: 290, r: 20 },
    { x: 110, y: 225, r: 18 },
    { x: 125, y: 150, r: 21 },
    { x: 200, y: 200, r: 22 },
]

// 3) The pizza drawing. It is plain SVG, so no image files are needed.
function PizzaIllustration() {
    return (
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Pizza">
            {/* Crust */}
            <circle cx="200" cy="200" r="190" fill={COLORS.crust} />
            <circle cx="200" cy="200" r="190" fill="none" stroke="#C98728" strokeWidth="4" />
            {/* Sauce */}
            <circle cx="200" cy="200" r="165" fill={COLORS.tomato} />
            {/* Cheese */}
            <circle cx="200" cy="200" r="150" fill={COLORS.cheese} />

            {/* Cheese bubbles */}
            <circle cx="150" cy="170" r="14" fill="#FFE59A" />
            <circle cx="255" cy="205" r="12" fill="#FFE59A" />
            <circle cx="195" cy="255" r="16" fill="#FFE59A" />
            <circle cx="235" cy="120" r="10" fill="#FFE59A" />

            {/* Pepperoni */}
            {pepperoni.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r={p.r} fill="#C0301C" />
                    <circle cx={p.x - 5} cy={p.y - 5} r={p.r / 4} fill="#E2563F" />
                    <circle cx={p.x + 6} cy={p.y + 4} r={p.r / 5} fill="#E2563F" />
                </g>
            ))}

            {/* Basil leaves */}
            {[
                { x: 165, y: 215, rot: -30 },
                { x: 235, y: 180, rot: 40 },
                { x: 205, y: 150, rot: 10 },
                { x: 250, y: 250, rot: -50 },
            ].map((l, i) => (
                <ellipse
                    key={i}
                    cx={l.x}
                    cy={l.y}
                    rx="16"
                    ry="8"
                    fill={COLORS.green}
                    transform={`rotate(${l.rot} ${l.x} ${l.y})`}
                />
            ))}

            {/* Slice lines (8 slices) */}
            {[0, 45, 90, 135].map((deg) => (
                <line
                    key={deg}
                    x1="200"
                    y1="10"
                    x2="200"
                    y2="390"
                    stroke="#B97A1E"
                    strokeOpacity="0.45"
                    strokeWidth="3"
                    transform={`rotate(${deg} 200 200)`}
                />
            ))}
        </svg>
    )
}

// 4) A small info chip, like "30 min delivery".
function Chip({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div
            className="flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm font-semibold backdrop-blur"
            style={{ borderColor: "rgba(31,42,31,0.1)", color: COLORS.ink }}
        >
            {icon}
            {text}
        </div>
    )
}

export default function Hero() {
    return (
        // <section
        //   className="relative overflow-hidden  w-full  max-w-[350px] mt-10 mx-auto rounded-3xl sm:max-w-[600px] md:max-w-[768px] lg:w-[1400px] lg:max-w-none"
        //   style={{ backgroundColor: COLORS.cream }}
        // >
        <section
            className="relative mx-auto mt-5 w-full overflow-hidden rounded-2xl sm:mt-7 sm:rounded-3xl lg:mt-10 lg:w-[1400px]"
            style={{ backgroundColor: COLORS.cream }}
        >
            {/* Soft background blobs for depth */}
            <div
                className="absolute -left-32 top-10 h-80 w-80 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: COLORS.green }}
            />
            <div
                className="absolute -right-24 bottom-0 h-96 w-96 rounded-full opacity-25 blur-3xl"
                style={{ backgroundColor: COLORS.tomato }}
            />

            {/* Width matches the navbar: outer px-4 + max-w-5xl (same as the floating pill).
          grid-cols-2 keeps text on the LEFT and pizza on the RIGHT at every screen size. */}
            <div className="px-4">
                <div className="relative mx-auto grid max-w-5xl grid-cols-2 items-center gap-3 py-10 sm:gap-8 sm:py-16 lg:gap-12 lg:py-24">
                    {/* LEFT: text */}
                    <div className="text-left">
                        <span
                            className="inline-block rounded-full px-3 py-1 text-[10px] font-bold text-white sm:px-4 sm:text-sm"
                            style={{ backgroundColor: COLORS.green }}
                        >
                            Fresh from the oven
                        </span>

                        <h1
                            className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:mt-5 sm:text-4xl lg:text-6xl"
                            style={{ color: COLORS.ink }}
                        >
                            Hot &amp; Fresh Pizza
                            <br />
                            Delivered to{" "}
                            <span className="relative whitespace-nowrap" style={{ color: COLORS.tomato }}>
                                Your Door
                                {/* Hand-drawn style underline */}
                                <svg
                                    viewBox="0 0 200 12"
                                    className="absolute -bottom-2 left-0 w-full"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M2 8 Q 50 0, 100 6 T 198 5"
                                        fill="none"
                                        stroke={COLORS.green}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                        </h1>

                        <p
                            className="mt-3 max-w-md text-xs leading-relaxed opacity-80 sm:mt-6 sm:text-base lg:text-lg"
                            style={{ color: COLORS.ink }}
                        >
                            Stone-baked crusts, rich tomato sauce and real mozzarella. Pick your
                            favorite pizza and we will bring it to you while it is still hot.
                        </p>

                        {/* CTA button */}
                        <div className="mt-5 flex sm:mt-8">
                            <Link href='/browse-menu'>
                            <Button
                                size="lg"
                                className="group h-10 rounded-full px-4 text-xs font-bold text-white shadow-lg hover:opacity-90 sm:h-12 sm:px-6 sm:text-base lg:h-14 lg:px-8"
                                style={{ backgroundColor: COLORS.tomato }}
                            >
                                Explore Pizza Menu
                                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 sm:ml-2 sm:h-5 sm:w-5" />
                            </Button>
                            </Link>
                        </div>

                        {/* Small trust chips (hidden on phones so the layout stays clean) */}
                        <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
                            <Chip
                                icon={<Clock className="h-4 w-4" style={{ color: COLORS.tomato }} />}
                                text="30 min delivery"
                            />
                            <Chip
                                icon={<Leaf className="h-4 w-4" style={{ color: COLORS.green }} />}
                                text="Fresh ingredients"
                            />
                            <Chip
                                icon={<Star className="h-4 w-4" style={{ color: "#E9A94B" }} />}
                                text="4.9 rated"
                            />
                        </div>
                    </div>

                    {/* RIGHT: slowly spinning pizza */}
                    <div className="relative mx-auto aspect-square w-full max-w-md scale-110 sm:scale-100">
                        {/* Plate shadow */}
                        <div
                            className="absolute inset-4 rounded-full blur-2xl"
                            style={{ backgroundColor: "rgba(31,42,31,0.25)" }}
                        />
                        <div
                            className="relative h-full w-full animate-spin drop-shadow-xl"
                            style={{ animationDuration: "40s" }}
                        >
                            <PizzaIllustration />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}