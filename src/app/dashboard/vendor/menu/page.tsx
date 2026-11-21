// // src/app/dashboard/vendor/menu/page.tsx
// import MyMenuPage from "@/app/components/MymenuPage"
// import { getItems, BASE_URL, type MenuItem } from "@/lib/vendor-menu-api"
// import { getServerUser } from "@/lib/session"
// import { requireVendorProfile } from "@/lib/require-vendor-profile"

// type VendorAccount = {
//   businessName: string
//   email: string
// }

// async function getVendorAccount(): Promise<VendorAccount> {
//   const user = await getServerUser()
//   const email = user?.email
//   if (!email) throw new Error("No email in session")

//   // Profile
//   const profileRes = await fetch(
//     `${BASE_URL}/profile/${encodeURIComponent(email)}`,
//     { cache: "no-store" }
//   )
//   if (!profileRes.ok) throw new Error("No profile")

//   const businessName = (await profileRes.json())?.businessName
//   if (!businessName) throw new Error("No business name")

//   return { businessName, email }
// }

// async function getPlan(email: string): Promise<{
//   premium: boolean
//   activeItemLimit: number | null
// } | null> {
//   try {
//     const res = await fetch(
//       `${BASE_URL}/subscription/${encodeURIComponent(email)}`,
//       { cache: "no-store" }
//     )
//     if (!res.ok) return null

//     return await res.json()
//   } catch {
//     return null
//   }
// }

// export default async function MyMenuItemsPage() {
//   // Must run BEFORE the try/catch below: redirect() works by throwing, and a
//   // catch block would swallow it. A vendor with an incomplete profile is sent
//   // to /dashboard/profile?setup=1 and never reaches the code under here.
//   await requireVendorProfile()

//   let menu: MenuItem[]
//   let premium = false
//   let activeItemLimit: number | null = 3

//   try {
//     const { businessName, email } = await getVendorAccount()
//     menu = await getItems(businessName)

//     const plan = await getPlan(email)
//     premium = Boolean(plan?.premium)
//     activeItemLimit = plan?.activeItemLimit ?? (premium ? null : 3)
//   } catch (error) {
//     console.error("Failed to load menu:", error)
//     return <p className="p-6 text-red-500">Could not load menu items.</p>
//   }

//   return (
//     <MyMenuPage
//       initialItems={menu}
//       premium={premium}
//       activeItemLimit={activeItemLimit}
//     />
//   )
// }












import MyMenuPage from "@/app/components/MymenuPage"
import { getItems, type MenuItem } from "@/lib/vendor-menu-api"
import { getVendorProfile } from "@/lib/profile-api"
import { getServerUser } from "@/lib/session"
import { requireVendorProfile } from "@/lib/require-vendor-profile"


async function getVendorAccount() {
  const user = await getServerUser()
  const email = user?.email

  if (!email) {
    throw new Error("No email in session")
  }

  const profile = await getVendorProfile(email)

  if (profile.role !== "vendor") {
    throw new Error("This account is not a vendor")
  }

  if (!profile.businessName?.trim()) {
    throw new Error("No business name found")
  }

  return {
    businessName: profile.businessName,
    email,
  }
}

async function getPlan(
  email: string
): Promise<{
  premium: boolean
  activeItemLimit: number | null
} | null> {
  try {
    const { BASE_URL } = await import("@/lib/vendor-menu-api")

    const res = await fetch(
      `${BASE_URL}/subscription/${encodeURIComponent(email)}`,
      { cache: "no-store" }
    )

    if (!res.ok) return null

    return await res.json()
  } catch {
    return null
  }
}

export default async function MyMenuItemsPage() {
  await requireVendorProfile()

  let menu: MenuItem[]
  let premium = false
  let activeItemLimit: number | null = 3

  try {
    const { businessName, email } = await getVendorAccount()

    menu = await getItems(businessName)

    const plan = await getPlan(email)

    premium = Boolean(plan?.premium)
    activeItemLimit = plan?.activeItemLimit ?? (premium ? null : 3)
  } catch (error) {
    console.error("Failed to load menu:", error)

    return (
      <p className="p-6 text-red-500">
        Could not load menu items.
      </p>
    )
  }

  return (
    <MyMenuPage
      initialItems={menu}
      premium={premium}
      activeItemLimit={activeItemLimit}
    />
  )
}
