
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
            {/* <div className="mt-4 flex items-center gap-2">
              {[
                { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
                { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
                { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[#FFF8EC]/70 transition hover:border-[#FFC857] hover:bg-[#FFC857] hover:text-[#1F2A1F]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div> */}
            {/* Social media */}
            <div className="mt-4 flex items-center gap-2">
              {[
                { name: "Facebook", href: "https://facebook.com" },
                { name: "Instagram", href: "https://instagram.com" },
                { name: "YouTube", href: "https://youtube.com" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="rounded-full border border-white/15 px-3 py-2 text-xs text-[#FFF8EC]/70 transition hover:border-[#FFC857] hover:bg-[#FFC857] hover:text-[#1F2A1F]"
                >
                  {item.name}
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
              {["Pizza", "Burgers", "Pasta", "Sides", "Desserts", "Drinks"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/browse-menu?category=${encodeURIComponent(item)}`}
                      className="transition hover:text-[#FFC857]"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
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
                  href="tel:+8801XXXXXXXXX"
                  className="transition hover:text-[#FFC857]"
                >
                  +880 1XXX-XXXXXX
                </a>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#E8452C]" />
                <a
                  href="mailto:support@yourdomain.com"
                  className="break-all transition hover:text-[#FFC857]"
                >
                  support@yourdomain.com
                </a>
              </li>
            </ul>

            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#FFC857] transition hover:text-white"
            >
              Contact us <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
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
