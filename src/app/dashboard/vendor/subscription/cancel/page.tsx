import Link from "next/link"
import { XCircle } from "lucide-react"
import { Bricolage_Grotesque } from "next/font/google"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const PLANS_PATH = "/dashboard/vendor/subscription"

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <div className="overflow-hidden rounded-3xl border border-[#2B1B14]/10 bg-white shadow-sm">
        <div className="bg-[#FFF8EC] px-8 py-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
            <XCircle className="h-8 w-8" />
          </span>

          <h1
            className={`${display.className} mt-4 text-3xl font-extrabold tracking-tight text-[#2B1B14]`}
          >
            Payment canceled
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-[#7A6258]">
            You were not charged and your account is still on the Free plan.
            You can upgrade to Premium whenever you are ready.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-8 py-8 sm:flex-row">
          <Link
            href={PLANS_PATH}
            className="flex h-11 flex-1 items-center justify-center bg-[#E8452C] px-5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#C2331B]"
          >
            Try again
          </Link>
          <Link
            href="/dashboard/vendor/menu"
            className="flex h-11 flex-1 items-center justify-center border border-[#2B1B14]/20 px-5 text-sm font-bold uppercase tracking-wider text-[#2B1B14] transition-colors hover:bg-[#FFF8EC]"
          >
            Back to my menu
          </Link>
        </div>
      </div>
    </section>
  )
}
