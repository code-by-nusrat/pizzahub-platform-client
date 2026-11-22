import Link from "next/link"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#2B1B14]/10 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
          <ShieldX className="h-8 w-8" />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-[#2B1B14]">
          Not allowed
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#7A6258]">
          This page belongs to a different account type. Sign in with the right
          account to continue.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center bg-[#E8452C] px-6 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
        >
          Go to my dashboard
        </Link>
      </div>
    </main>
  )
}
