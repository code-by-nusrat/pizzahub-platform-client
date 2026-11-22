import Link from "next/link"
import { Ban } from "lucide-react"

export default function BlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8EC] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#2B1B14]/10 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
          <Ban className="h-8 w-8" />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-[#2B1B14]">
          Account blocked
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#7A6258]">
          An administrator has blocked this account. You cannot use the
          dashboard or place orders until it is unblocked again.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center bg-[#E8452C] px-6 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
