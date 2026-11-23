import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, ImageOff } from "lucide-react"
import { Fraunces } from "next/font/google"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getMenuItem } from "@/lib/vendor-menu-api"
import OrderPanel from "./OrderPanel"
import Navbar from "@/app/components/Navbar"
import Footer from "@/app/components/Footer"

const serif = Fraunces({ subsets: ["latin"], style: ["normal", "italic"] })

const STEPS = [
    {
        title: "Add to cart",
        text: "Pick how many, then add your delivery date and address in the cart.",
    },
    {
        title: "Made fresh",
        text: "The kitchen starts cooking once it accepts your order.",
    },
    {
        title: "At your door",
        text: "It arrives on the date you chose.",
    },
]

export default async function MenuDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session?.user) redirect("/sign-in")

    // Only customers may open the details page.
    // Vendors and admins are blocked (same page the rest of the app uses).
    // (The backend also refuses orders from anyone but customers.)
    const role = (session.user as { role?: string }).role
    if (role !== "customer") redirect("/unauthorized")

    if ((session.user as { status?: string }).status === "blocked") {
        redirect("/blocked")
    }

    const item = await getMenuItem(id)

    // Unknown, unapproved or deleted dishes show the 404 page
    if (!item) notFound()

    const vendor = item.businessName || "Local kitchen"
    const available = item.isAvailable !== false
    const price = Number(item.price)

    return (
        <main
            className="min-h-screen bg-[#FBF5E6] px-4 py-2 sm:px-8 sm:py-2"
            style={{
                backgroundImage:
                    "radial-gradient(rgba(20,83,45,0.09) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
            }}
        >
            <div className="mx-auto max-w-5xl">
                <Navbar></Navbar>
                {/* Top line */}
                <div className="flex items-center justify-between gap-4 text-sm font-medium text-green-800">
                    
                    <span className="hidden tracking-[0.25em] uppercase sm:block">
                        {item.category}
                    </span>
                </div>

                <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                    {/* ---------- The plate ---------- */}
                    <div className="relative mx-auto aspect-square w-full max-w-md">
                        {/* Slowly turning ring of text */}
                        <svg
                            viewBox="0 0 200 200"
                            aria-hidden
                            className="absolute inset-0 h-full w-full animate-[spin_50s_linear_infinite] motion-reduce:animate-none"
                        >
                            <defs>
                                <path
                                    id="plate-ring"
                                    d="M 100,100 m -89,0 a 89,89 0 1,1 178,0 a 89,89 0 1,1 -178,0"
                                />
                            </defs>
                            <text
                                className="fill-green-800"
                                fontSize="9.5"
                                fontWeight="600"
                                letterSpacing="2.4"
                                textLength="552"
                                lengthAdjust="spacing"
                            >
                                <textPath href="#plate-ring">
                                    MADE FRESH TO ORDER ✦ KITCHEN FAVOURITE ✦ MADE FRESH TO ORDER ✦
                                    KITCHEN FAVOURITE ✦
                                </textPath>
                            </text>
                        </svg>

                        {/* The dish */}
                        <div className="absolute inset-[13%] overflow-hidden rounded-full bg-green-900/10 shadow-[0_30px_60px_-20px_rgba(20,83,45,0.5)] ring-8 ring-white">
                            {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-green-800/30">
                                    <ImageOff className="h-16 w-16" />
                                </div>
                            )}
                        </div>

                        {/* Price sticker */}
                        <div className="absolute bottom-[7%] right-[2%] flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full border-2 border-dashed border-green-800/50 bg-white text-center shadow-xl sm:h-28 sm:w-28">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-green-700">
                                Only
                            </span>
                            <span
                                className={`${serif.className} text-xl font-semibold italic leading-tight text-green-900 sm:text-2xl`}
                            >
                                ৳{price.toFixed(0)}
                            </span>
                        </div>
                    </div>

                    {/* ---------- The menu entry ---------- */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">
                            {item.category} · Nº {id.slice(-3).toUpperCase()}
                        </p>

                        <h1
                            className={`${serif.className} mt-3 text-5xl font-semibold italic leading-[0.95] tracking-tight text-green-900 sm:text-6xl`}
                        >
                            {item.name}
                        </h1>

                        {/* Menu-style rows */}
                        <dl className="mt-7 space-y-3 text-green-900">
                            <Leader label="Kitchen" value={vendor} />
                            <Leader label="Area" value={item.location} />
                            <Leader
                                label="Status"
                                value={available ? "Ready to order" : "Unavailable now"}
                            />
                        </dl>

                        <p
                            className={`${serif.className} mt-7 text-lg leading-8 text-green-800 first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-green-900`}
                        >
                            {item.description || "No description provided."}
                        </p>

                        <div className="mt-8">
                            <OrderPanel
                                menuId={item._id}
                                name={item.name}
                                price={price}
                                image={item.image}
                                businessName={item.businessName}
                                available={available}
                            />
                        </div>
                    </div>
                </div>

                {/* ---------- How it works ---------- */}
                <section className="mt-16 border-t border-dotted border-green-900/30 pt-10">
                    <h2
                        className={`${serif.className} text-center text-2xl font-semibold italic text-green-900`}
                    >
                        How ordering works
                    </h2>

                    <ol className="mt-8 grid gap-8 sm:grid-cols-3">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="text-center">
                                <span
                                    className={`${serif.className} block text-6xl font-semibold italic leading-none text-green-800/25`}
                                >
                                    {index + 1}
                                </span>
                                <h3 className="mt-2 font-bold text-green-900">{step.title}</h3>
                                <p className="mx-auto mt-1 max-w-[16rem] text-sm leading-6 text-green-700">
                                    {step.text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>
                
            </div>
        </main>
    )
}

// "Label ............ Value", like a printed menu
function Leader({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-3">
            <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                {label}
            </dt>
            <span
                aria-hidden
                className="flex-1 -translate-y-0.75 border-b-2 border-dotted border-green-900/30"
            />
            <dd className="min-w-0 truncate text-right font-semibold">{value}</dd>
        </div>
    )
}