
import Link from "next/link"
import { Home, Pizza, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf2] px-5 py-16">
      {/* Background decorations */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Pizza icon */}
        <div className="mx-auto mb-7 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-lg shadow-orange-200/50">
          <Pizza size={48} strokeWidth={1.5} />
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black tracking-tighter text-orange-500 sm:text-9xl">
          404
        </h1>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
          <Search size={15} />
          Oops! Page not found
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-4xl">
          Looks like this pizza is missing!
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
          The page you&apos;re looking for may have been removed,
          renamed, or is temporarily unavailable.
          Don&apos;t worry, there&apos;s still plenty of delicious pizza waiting for you!
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600 sm:w-auto"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/browse-menu"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-7 py-3.5 font-semibold text-orange-600 transition hover:-translate-y-1 hover:bg-orange-50 sm:w-auto"
          >
            Explore Menu
            <ArrowLeft className="rotate-180" size={18} />
          </Link>
        </div>

        <p className="mt-12 text-xs font-medium tracking-widest text-gray-400">
          PIZZAHUB · FRESHLY MADE WITH LOVE
        </p>
      </div>
    </main>
  )
}
