import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ArrowLeft, CircleAlert } from "lucide-react"

import ProfilePage from "@/app/components/ProfilePage"
import { auth } from "@/lib/auth"
import { getProfile, type Profile } from "@/lib/profile-api"

export const metadata: Metadata = {
  title: "Profile | PizzaHub",
  description: "Update your PizzaHub name, photo and account details.",
}

export default async function ProfileRoute({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>
}) {
  const { setup } = await searchParams

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.email) {
    redirect("/sign-in")
  }

  const email = session.user.email

  let profile: Profile | null = null

  try {
    profile = await getProfile(email)
  } catch (error) {
    console.error("Profile loading error:", error)
  }

  if (!profile) {
    return (
      <main className="flex min-h-full items-center justify-center bg-[#FFF8EC] px-4 py-16">
        <div className="w-full max-w-md rounded-[30px] border border-[#2B1B14]/10 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8452C]/10 text-[#E8452C]">
            <CircleAlert className="size-6" />
          </span>

          <h1 className="mt-5 text-xl font-extrabold text-[#2B1B14]">
            We could not load your profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#7A6258]">
            Something went wrong while fetching your details. Please try again
            in a moment.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E8452C] px-5 text-sm font-bold text-white transition hover:bg-[#C2331B]"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  const sessionRole = (session.user as { role?: string }).role
  const role = profile.role || sessionRole || "customer"

  return (
    <>
      {/* Only vendors who were sent here to finish their profile see this */}
      {setup && role === "vendor" && (
        <div
          role="status"
          className="mx-auto mt-6 flex max-w-3xl items-start gap-3 border-l-2 border-[#E8452C] bg-white px-4 py-3 text-sm text-[#2B1B14] shadow-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#E8452C]" />
          <p>
            <span className="font-bold">Finish your restaurant profile.</span>{" "}
            Add your business name, location and opening hours to unlock the
            rest of your dashboard.
          </p>
        </div>
      )}

      <ProfilePage
        initialProfile={{
          ...profile,
          email: profile.email || email,
          name: profile.name || session.user.name || "",
          role,
        }}
      />
    </>
  )
}