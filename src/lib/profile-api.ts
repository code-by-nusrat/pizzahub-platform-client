
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
