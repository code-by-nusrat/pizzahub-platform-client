
import Link from "next/link"
import {
  Pizza,
  Mail,
  Phone,
  MapPin,

  ArrowUpRight,
} from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// Brand icons (this lucide version no longer ships brand logos)
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.1 16.03 2 14.8 2 12.28 2 10.5 3.54 10.5 6.36V9.5H8v4h2.5V22h3.5v-8.5Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SOCIALS = [
  { name: "X", href: "https://x.com", Icon: XIcon },
  { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { name: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
]

const MENU_LINKS = [
  { label: "Pizza", query: "Pizza" },
  { label: "Burgers", query: "Burger" },
  { label: "Pasta", query: "Pasta" },
  { label: "Sides", query: "Sides" },
  { label: "Desserts", query: "Dessert" },
  { label: "Drinks", query: "Drinks" },
]

const Footer = () => {
  return (
    <footer className="bg-[#1F2A1F] text-[#FFF8EC]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8452C]">
                <Pizza className="h-5 w-5 text-white" />
              </span>

              <span className={`${display.className} text-xl font-extrabold`}>
                Pizza<span className="text-[#FFC857]">Hub</span>
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#FFF8EC]/65">
              Good food, great moments. Enjoy freshly prepared pizza delivered
              straight to your door.
            </p>

            {/* Social media */}
            <div className="mt-4 flex items-center gap-2">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#FFF8EC]/70 transition hover:border-[#FFC857] hover:bg-[#FFC857] hover:text-[#1F2A1F]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className={`${display.className} mb-3 text-sm font-bold text-[#FFC857]`}>
              Explore
            </h3>

            <ul className="space-y-2 text-sm text-[#FFF8EC]/70">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Menu", href: "/browse-menu" },
                { label: "My Cart", href: "/cart" },
                { label: "Sign In", href: "/sign-in" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition hover:text-[#FFC857]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <h3 className={`${display.className} mb-3 text-sm font-bold text-[#FFC857]`}>
              Our Menu
            </h3>

            <ul className="space-y-2 text-sm text-[#FFF8EC]/70">
              {MENU_LINKS.map((item) => (
                <li key={item.query}>
                  <Link
                    href={`/browse-menu?category=${encodeURIComponent(item.query)}`}
                    className="transition hover:text-[#FFC857]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`${display.className} mb-3 text-sm font-bold text-[#FFC857]`}>
              Get in Touch
            </h3>

            <ul className="space-y-3 text-sm text-[#FFF8EC]/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#E8452C]" />
                Dhaka, Bangladesh
              </li>

              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#E8452C]" />
                <a
                  href="tel:+8801700123456"
                  className="transition hover:text-[#FFC857]"
                >
                  +880 1700-123456
                </a>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#E8452C]" />
                <a
                  href="mailto:support@pizzahub.com"
                  className="break-all transition hover:text-[#FFC857]"
                >
                  support@pizzahub.com
                </a>
              </li>
            </ul>

            <a
              href="mailto:support@pizzahub.com"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#FFC857] transition hover:text-white"
            >
              Contact us <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-[#FFF8EC]/50 sm:flex-row">
          <p>© {new Date().getFullYear()} PizzaHub. All rights reserved.</p>
          <p>
            Made with <span className="text-[#E8452C]">♥</span> for pizza lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
