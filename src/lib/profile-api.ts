

import { BASE_URL } from "@/lib/vendor-menu-api"

export type Profile = {
  email: string
  role: string
  name: string
  phone: string
  address: string
  bio: string
  image: string
  businessName: string
  businessLocation: string
  openingHours: string
  createdAt?: string
}

export type CustomerProfile = Omit<
  Profile,
  "businessName" | "businessLocation" | "openingHours"
>

export type ProfileUpdate = Partial<
  Omit<Profile, "email" | "role" | "createdAt">
>

export type VendorProfileUpdate = ProfileUpdate

export type CustomerProfileUpdate = Partial<
  Omit<CustomerProfile, "email" | "role" | "createdAt">
>

// Common response handler
// async function handleResponse<T>(res: Response): Promise<T> {
//   const rawResponse = await res.text()

//   let body: unknown = {}

//   try {
//     body = rawResponse ? JSON.parse(rawResponse) : {}
//   } catch {
//     body = rawResponse
//   }

//   if (!res.ok) {
//     console.error("PROFILE API ERROR:", {
//       status: res.status,
//       url: res.url,
//       response: body,
//     })

//     const message =
//       typeof body === "object" && body !== null && "message" in body
//         ? String(body.message)
//         : typeof body === "string"
//           ? body
//           : ""

//     throw new Error(message || `Profile request failed: ${res.status}`)
//   }

//   return body as T
// }

async function handleResponse<T>(res: Response): Promise<T> {
  const rawResponse = await res.text()

  let body: unknown = {}

  try {
    body = rawResponse ? JSON.parse(rawResponse) : {}
  } catch {
    body = rawResponse
  }

 
  return body as T
}


// ===================================
// VENDOR PROFILE API
// ===================================

export async function getVendorProfile(
  email: string
): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  return handleResponse<Profile>(res)
}

export async function updateVendorProfile(
  email: string,
  data: VendorProfileUpdate
): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  return handleResponse<Profile>(res)
}

// ===================================
// CUSTOMER PROFILE API
// ===================================

export async function getCustomerProfile(
  email: string
): Promise<CustomerProfile> {
  const res = await fetch(
    `${BASE_URL}/customer-profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  return handleResponse<CustomerProfile>(res)
}

export async function updateCustomerProfile(
  email: string,
  data: CustomerProfileUpdate
): Promise<Profile> {
  const res = await fetch(
    `${BASE_URL}/customer-profile/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  return handleResponse<Profile>(res)
}

// ===================================
// COMMON PROFILE API
// ===================================

// export async function getProfile(
//   email: string
// ): Promise<Profile> {
//   const vendorRes = await fetch(
//     `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
//     { cache: "no-store" }
//   )

//   if (vendorRes.ok) {
//     return handleResponse<Profile>(vendorRes)
//   }

//   // If the account is not a vendor, try customer profile.
//   const customerRes = await fetch(
//     `${BASE_URL}/customer-profile/${encodeURIComponent(email)}`,
//     { cache: "no-store" }
//   )

//   return handleResponse<Profile>(customerRes)
// }
export async function getProfile(
  email: string
): Promise<Profile> {
  const vendorRes = await fetch(
    `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  // Vendor profile found.
  if (vendorRes.ok) {
    return handleResponse<Profile>(vendorRes)
  }

  // Only try customer profile if the vendor profile does not exist.
  // Do not hide blocked-account or server errors.
  if (vendorRes.status !== 404) {
    return handleResponse<Profile>(vendorRes)
  }

  const customerRes = await fetch(
    `${BASE_URL}/customer-profile/${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  return handleResponse<Profile>(customerRes)
}

export async function updateProfile(
  email: string,
  data: ProfileUpdate
): Promise<Profile> {
  const profile = await getProfile(email)

  if (profile.role === "vendor") {
    return updateVendorProfile(email, data)
  }

  return updateCustomerProfile(email, data)
}

