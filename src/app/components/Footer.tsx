import Link from "next/link"
import { ArrowRight, Mail, MapPin, Phone, Pizza } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// TODO: replace these placeholders with your real contact details
const CONTACT = {
  address: "Dhaka, Bangladesh",
  phone: "+880 1XXX-XXXXXX",
  email: "support@yourdomain.com",
}

// TODO: replace these with your real social media pages
const SOCIAL = [
  { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { name: "X", href: "https://x.com", icon: "x" },
  { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
] as const

type SocialName = (typeof SOCIAL)[number]["icon"]

// Simple outline icons (drawn here so no extra icon package is needed)
function SocialIcon({ name }: { name: SocialName }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  }

  switch (name) {
    case "facebook":
      return (
        <svg {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    case "instagram":
      return (
        <svg {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    case "x":
      return (
        <svg {...props}>
          <path d="M4 4l11.733 16H20L8.267 4z" />
          <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
        </svg>
      )
    case "youtube":
      return (
        <svg {...props}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </svg>
      )
  }
}

// Same categories as the homepage category section
const menuLinks = [
  { label: "Pizza", query: "Pizza" },
  { label: "Burgers", query: "Burger" },
  { label: "Pasta", query: "Pasta" },
  { label: "Sides", query: "Sides" },
  { label: "Desserts", query: "Dessert" },
  { label: "Drinks", query: "Drinks" },
]

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
  { label: "Cart", href: "/cart" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Create Account", href: "/sign-up" },
]

const linkClass =
  "inline-block rounded text-[#FFF8EC]/75 transition-colors hover:text-[#FFC857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC857]"

const headingClass = `${display.className} mb-4 text-base font-extrabold text-[#FFF8EC]`

const Footer = () => {
  return (
    <footer className="bg-[#1F2A1F] px-3 pb-3 pt-10 sm:px-4 sm:pb-4 sm:pt-14">
      {/* Banner panel (same width as the other homepage sections) */}
      <div className="relative mx-auto w-full overflow-hidden  px-6 pt-14 text-[#FFF8EC] sm:px-12 sm:pt-20">
        {/* Soft glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(232,69,44,0.35),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(47,107,58,0.45),transparent_50%)]"
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Call to action */}
          <div className="flex flex-col items-start justify-between gap-6 border-b border-white/15 pb-12 md:flex-row md:items-center">
            <div className="max-w-lg">
              <h2
                className={`${display.className} text-3xl font-extrabold tracking-tight sm:text-4xl`}
              >
                Hungry? Your pizza is{" "}
                <span className="text-[#FFC857]">30 minutes</span> away.
              </h2>
              <p className="mt-3 text-base text-[#FFF8EC]/75">
                Pick your favorite and we will bring it while it is still hot.
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#E8452C] px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#D63A22] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFC857] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Order now
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6B3A]">
                  <Pizza className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
                <span className="text-lg font-extrabold tracking-tight">
                  Pizza<span className="text-[#E8452C]">Hub</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#FFF8EC]/75">
                Fresh pizza from local kitchens across Dhaka, delivered hot to
                your door.
              </p>

              {/* Social media links */}
              <ul className="mt-6 flex gap-3">
                {SOCIAL.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`PizzaHub on ${item.name} (opens in a new tab)`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-[#FFF8EC] transition-colors hover:border-[#E8452C] hover:bg-[#E8452C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC857]"
                    >
                      <SocialIcon name={item.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Menu */}
            <nav aria-label="Menu categories">
              <h3 className={headingClass}>Our menu</h3>
              <ul className="space-y-2.5 text-sm">
                {menuLinks.map((item) => (
                  <li key={item.query}>
                    <Link
                      href={`/browse-menu?category=${encodeURIComponent(item.query)}`}
                      className={linkClass}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Explore */}
            <nav aria-label="Site links">
              <h3 className={headingClass}>Explore</h3>
              <ul className="space-y-2.5 text-sm">
                {exploreLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <div>
              <h3 className={headingClass}>Get in touch</h3>
              <ul className="space-y-3 text-sm text-[#FFF8EC]/75">
                <li className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC857]"
                    aria-hidden="true"
                  />
                  {CONTACT.address}
                </li>
                <li className="flex items-start gap-3">
                  <Phone
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC857]"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`}
                    className={linkClass}
                  >
                    {CONTACT.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC857]"
                    aria-hidden="true"
                  />
                  <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                    {CONTACT.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-start justify-between gap-2 border-t border-white/15 py-6 text-sm text-[#FFF8EC]/60 sm:flex-row sm:items-center">
            <p>&copy; {new Date().getFullYear()} PizzaHub. All rights reserved.</p>
            <p>Made with care in Dhaka.</p>
          </div>
        </div>

        
      </div>
    </footer>
  )
}

export default Footer