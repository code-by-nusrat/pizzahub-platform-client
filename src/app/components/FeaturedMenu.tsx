import Link from "next/link"
import { ArrowRight, ImageOff, MapPin, Store } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

type FeaturedItem = {
    _id: string
    name: string
    category: string
    price: number
    location: string
    businessName?: string
    image?: string
    approvalStatus?: string
    isAvailable?: boolean
}

// The public endpoint only exposes approved dishes; the extra checks keep the
// section correct even if that ever changes.
async function getFeaturedItems(): Promise<FeaturedItem[]> {
    try {
        const res = await fetch(`${API}/browse-menu`, { cache: "no-store" })
        if (!res.ok) return []

        const data = (await res.json()) as unknown
        if (!Array.isArray(data)) return []

        return (data as FeaturedItem[])
            .filter(
                (item) =>
                    item?.approvalStatus === "approved" &&
                    item?.isAvailable !== false &&
                    Boolean(item?._id) &&
                    Boolean(item?.name)
            )
            .slice(0, 6)
    } catch {
        // A backend hiccup should never take the landing page down.
        return []
    }
}

export default async function FeaturedMenu() {
    const items = await getFeaturedItems()

    if (items.length === 0) return null

    return (
        <section
            aria-labelledby="featured-heading"
            className="px-3 py-10 sm:px-4 sm:py-14"
        >
            <div className="mx-auto max-w-[1400px]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="inline-block rounded-full bg-[#E8452C]/10 px-3 py-1 text-sm font-semibold text-[#C2331B]">
                            Fresh from our kitchens
                        </p>
                        <h2
                            id="featured-heading"
                            className={`${display.className} mt-3 text-3xl font-extrabold tracking-tight text-[#2B1B14] sm:text-4xl`}
                        >
                            Featured menu items
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-[#7A6258]">
                            Hand-picked dishes that are approved and available right now.
                        </p>
                    </div>

                    <Link
                        href="/browse-menu"
                        className="group inline-flex items-center gap-2 border border-[#2B1B14]/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#2B1B14] transition hover:border-[#E8452C] hover:text-[#E8452C]"
                    >
                        View all dishes
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <li key={item._id} className="h-full">
                            <FeaturedCard item={item} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
    const vendor = item.businessName || "Local kitchen"

    return (
        <article className="flex h-full flex-col overflow-hidden border border-[#2B1B14]/10 bg-white transition hover:-translate-y-0.5 hover:border-[#E8452C]/40 hover:shadow-md">
            <div className="relative aspect-4/3 overflow-hidden bg-[#FFF1DD]">
                {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[#E8452C]/40">
                        <ImageOff className="h-10 w-10" />
                    </div>
                )}

                <span className="absolute left-0 top-4 bg-[#2B1B14] px-3 py-1 text-xs font-semibold text-[#FFF8EC]">
                    {item.category}
                </span>
            </div>

            <div className="flex flex-1 flex-col bg-[#FFF8EC] px-5 pb-6 pt-5">
                <p className="flex items-center gap-1.5 text-sm text-[#7A6258]">
                    <Store className="h-3.5 w-3.5 shrink-0 text-[#E8452C]" />
                    <span className="truncate">{vendor}</span>
                </p>

                <h3
                    className={`${display.className} mt-1.5 text-lg font-extrabold leading-snug text-[#2B1B14]`}
                >
                    {item.name}
                </h3>

                <p className="mt-2 flex items-center gap-1 text-xs text-[#7A6258]">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {item.location}
                </p>

                <p className="mt-3 text-xl font-bold text-[#E8452C]">
                    ৳{Number(item.price).toFixed(2)}
                </p>

                <div className="mt-auto pt-5">
                    <Link
                        href={`/menu/${item._id}`}
                        className="flex h-10 w-full items-center justify-center gap-2 bg-[#2B1B14] text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8452C]"
                    >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    )
}
