
"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react"

import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CircleCheck,
  Clock,
  ImagePlus,
  Link2,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  Pizza,
  RotateCcw,
  Save,
  ShoppingBag,
  Sparkles,
  Store,
  Trash,
  TriangleAlert,
  Upload,
  User,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react"

import Link from "next/link"
import { toast } from "react-toastify"
import { Bricolage_Grotesque } from "next/font/google"

import { authClient } from "@/lib/auth-client"

import type { Profile } from "@/lib/profile-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateProfileAction } from "@/lib/actions/profile-actions"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const BIO_LIMIT = 300

type FormState = {
  name: string
  phone: string
  address: string
  bio: string
  image: string
  businessName: string
  businessLocation: string
  openingHours: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

type Feedback = {
  type: "success" | "error"
  title: string
  message: string
}

type ImageMode = "upload" | "link"

function toForm(profile: Profile): FormState {
  return {
    name: profile.name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    bio: profile.bio || "",
    image: profile.image || "",
    businessName: profile.businessName || "",
    businessLocation: profile.businessLocation || "",
    openingHours: profile.openingHours || "",
  }
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "?"
  )
}

function isImageValue(value: string) {
  if (/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(value)) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function validate(form: FormState, isVendor: boolean): FormErrors {
  const errors: FormErrors = {}

  const name = form.name.trim()
  const phone = form.phone.trim()

  if (name.length < 2) {
    errors.name = "Please enter at least 2 characters."
  } else if (name.length > 60) {
    errors.name = "Please keep your name under 60 characters."
  }

  if (phone && !/^\+?[0-9\s()-]{7,18}$/.test(phone)) {
    errors.phone = "Use 7–18 digits. Spaces, +, - and () are allowed."
  }

  if (form.address.trim().length > 160) {
    errors.address = "Please keep the address under 160 characters."
  }

  if (form.bio.length > BIO_LIMIT) {
    errors.bio = `Maximum ${BIO_LIMIT} characters allowed.`
  }

  const image = form.image.trim()

  if (image && !isImageValue(image)) {
    errors.image = "Paste a valid http(s) image link or upload a photo."
  }

  if (isVendor) {
    const businessName = form.businessName.trim()

    if (businessName.length < 2) {
      errors.businessName = "Your restaurant name is required."
    } else if (businessName.length > 80) {
      errors.businessName =
        "Please keep the restaurant name under 80 characters."
    }

    if (form.businessLocation.trim().length > 120) {
      errors.businessLocation =
        "Please keep the location under 120 characters."
    }

    if (form.openingHours.trim().length > 80) {
      errors.openingHours =
        "Please keep the opening hours under 80 characters."
    }
  }

  return errors
}

async function optimizeImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a PNG, JPG or WebP image.")
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error("That photo is too large. Please choose one under 6 MB.")
  }

  const bitmap = await createImageBitmap(file)

  const maxSide = 320

  const scale = Math.min(
    1,
    maxSide / Math.max(bitmap.width, bitmap.height)
  )

  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")

  if (!context) {
    bitmap.close()
    throw new Error("We could not process that photo. Please try another one.")
  }

  context.fillStyle = "#FFF8EC"
  context.fillRect(0, 0, width, height)

  context.imageSmoothingQuality = "high"
  context.drawImage(bitmap, 0, 0, width, height)

  bitmap.close()

  let dataUrl = canvas.toDataURL("image/jpeg", 0.72)

  if (dataUrl.length > 85000) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.5)
  }

  if (dataUrl.length > 95000) {
    throw new Error("That photo is too detailed. Please choose a smaller one.")
  }

  return dataUrl
}

function Avatar({ src, name }: { src: string; name: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const showImage = Boolean(src.trim()) && failedSrc !== src

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ? `${name}'s profile photo` : "Profile photo"}
        onError={() => setFailedSrc(src)}
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#E8452C,#F2751A)] text-3xl font-extrabold tracking-tight text-white">
      {initialsOf(name)}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-[#2B1B14]"
        >
          {label}

          {required && <span className="text-[#E8452C]">*</span>}

          {optional && (
            <span className="ml-1 text-[11px] font-medium text-[#7A6258]">
              optional
            </span>
          )}
        </Label>

        {hint && (
          <span className="text-[11px] font-medium text-[#7A6258]">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#C2331B]"
        >
          <TriangleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function SectionHeading({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#E8452C]">
        <Icon className="size-5" />

        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2B1B14] px-1 text-[9px] font-bold text-white">
          {step}
        </span>
      </div>

      <div>
        <h2 className="text-base font-extrabold text-[#2B1B14] sm:text-lg">
          {title}
        </h2>

        <p className="text-xs leading-5 text-[#7A6258]">{description}</p>
      </div>
    </div>
  )
}

export default function ProfilePage({
  initialProfile,
}: {
  initialProfile: Profile
}) {
  const [saved, setSaved] = useState(initialProfile)

  const [form, setForm] = useState<FormState>(() =>
    toForm(initialProfile)
  )

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const [imageMode, setImageMode] = useState<ImageMode>(() =>
    initialProfile.image?.trim() &&
    !initialProfile.image.startsWith("data:")
      ? "link"
      : "upload"
  )

  const [imageBusy, setImageBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVendor = saved.role === "vendor"
  const isAdmin = saved.role === "admin"

  const roleLabel = isVendor
    ? "Vendor"
    : isAdmin
      ? "Admin"
      : "Customer"

  const errors = validate(form, isVendor)
  const shownErrors = submitted ? errors : {}

  const dirty =
    JSON.stringify(form) !== JSON.stringify(toForm(saved))

  // Only required fields determine profile strength.
  const trackedFields = isVendor
    ? [form.name, form.businessName]
    : [form.name]

  const filledFields = trackedFields.filter(
    (value) => value.trim().length > 0
  ).length

  const completeness = Math.round(
    (filledFields / trackedFields.length) * 100
  )

  const remaining = trackedFields.length - filledFields

  const ringStyle = {
    background: `conic-gradient(#F2751A ${completeness * 3.6}deg, rgba(255,255,255,0.14) 0deg)`,
  }

  const memberSince = saved.createdAt
    ? new Date(saved.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "New member"

  const heroTitle = isVendor
    ? "Your restaurant, your story."
    : isAdmin
      ? "Keep your account in shape."
      : "Make every slice feel like yours."

  const heroDescription = isVendor
    ? "Update the details customers see before they order — your name, your photo, and your restaurant's essential information."
    : "Update your name, photo and contact details so every order, review and pickup feels personal."

  const linkValue = form.image.startsWith("data:")
    ? ""
    : form.image

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }))

    if (feedback) {
      setFeedback(null)
    }
  }

  async function handleImageFile(file: File) {
    setImageBusy(true)
    setFeedback(null)

    try {
      const dataUrl = await optimizeImage(file)

      updateField("image", dataUrl)
      setImageMode("upload")

      toast.info("Photo added. Save your profile to keep it.")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not read that photo. Please try another one."

      setFeedback({
        type: "error",
        title: "Photo could not be added",
        message,
      })

      toast.error(message)
    } finally {
      setImageBusy(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    event.target.value = ""

    if (file) {
      void handleImageFile(file)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      void handleImageFile(file)
    }
  }

  function removePhoto() {
    updateField("image", "")

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast.info("Profile photo removed. Save to confirm.")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving || imageBusy) return

    setSubmitted(true)
    setFeedback(null)

    const currentErrors = validate(form, isVendor)

    if (Object.keys(currentErrors).length > 0) {
      setFeedback({
        type: "error",
        title: "Almost there",
        message: "Please correct the highlighted fields, then try again.",
      })

      toast.error("Please correct the highlighted fields.")

      const firstInvalid = Object.keys(currentErrors)[0]

      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus()
      }

      return
    }

    if (!dirty) return

    try {
      setSaving(true)

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
        image: form.image.trim(),

        ...(isVendor
          ? {
              businessName: form.businessName.trim(),
              businessLocation: form.businessLocation.trim(),
              openingHours: form.openingHours.trim(),
            }
          : {}),
      }

      const result = await updateProfileAction(payload)

      if (!result.success) {
        throw new Error(result.message)
      }

      const updated = result.profile

      const nextProfile: Profile = {
        ...saved,
        ...updated,
        email: saved.email,
        role: saved.role,
        createdAt: updated.createdAt || saved.createdAt,
      }

      setSaved(nextProfile)
      setForm(toForm(nextProfile))
      setSubmitted(false)

      setFeedback({
        type: "success",
        title: "Profile updated",
        message: isVendor
          ? "Your restaurant details are saved and ready for customers."
          : "Your details are saved.",
      })

      toast.success("Your profile has been updated!")

      // Synchronize name and image with Better Auth.
      try {
        await authClient.updateUser({
          name: form.name.trim(),
          image: form.image.trim() || null,
        })
      } catch (syncError) {
        console.warn(
          "Profile saved, but Better Auth details could not be synced:",
          syncError
        )
      }
    } catch (error) {
      console.error("Profile update error:", error)

      const message =
        error instanceof Error
          ? error.message
          : "Could not update profile."

      setFeedback({
        type: "error",
        title: "We could not save your profile",
        message,
      })

      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  function discardChanges() {
    setForm(toForm(saved))
    setSubmitted(false)
    setFeedback(null)

    toast.info("Changes discarded.")
  }

  return (
    <main className="relative min-h-full bg-[#FFF8EC] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#F2751A]/10 blur-3xl" />

        <div className="absolute -right-24 top-48 h-96 w-96 rounded-full bg-[#2F6B3A]/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(#2B1B14 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E8452C]/20 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8452C] shadow-sm">
                <Pizza className="size-3.5" />
                PizzaHub profile studio
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F6B3A]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#2F6B3A]">
                <BadgeCheck className="size-3.5" />
                {roleLabel} account
              </span>
            </div>

            <h1
              className={`${display.className} text-4xl font-extrabold leading-[1.05] tracking-tight text-[#2B1B14] sm:text-5xl`}
            >
              {heroTitle}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[#7A6258] sm:text-base">
              {heroDescription}
            </p>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2B1B14] underline decoration-[#F2751A]/40 decoration-2 underline-offset-4 transition hover:text-[#E8452C]"
            >
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-2xl border border-[#2B1B14]/10 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A6258]">
                Profile strength
              </p>

              <p
                className={`${display.className} mt-1 text-2xl font-extrabold text-[#2B1B14]`}
              >
                {completeness}%
              </p>
            </div>

            <div className="rounded-2xl border border-[#2B1B14]/10 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A6258]">
                Member since
              </p>

              <p className="mt-1 text-sm font-extrabold leading-8 text-[#2B1B14]">
                {memberSince}
              </p>
            </div>
          </div>
        </header>

        {/* Inline feedback */}
        {feedback && (
          <div
            aria-live="polite"
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-sm ${
              feedback.type === "success"
                ? "border-[#2F6B3A]/20 bg-[#2F6B3A]/[0.07] text-[#24512C]"
                : "border-[#E8452C]/25 bg-[#E8452C]/[0.07] text-[#A52A15]"
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                feedback.type === "success"
                  ? "bg-[#2F6B3A] text-white"
                  : "bg-[#E8452C] text-white"
              }`}
            >
              {feedback.type === "success" ? (
                <CircleCheck className="size-4" />
              ) : (
                <TriangleAlert className="size-4" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">{feedback.title}</p>

              <p className="mt-0.5 text-sm leading-5 opacity-80">
                {feedback.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="rounded-lg p-1.5 opacity-60 transition hover:bg-black/5 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[350px_minmax(0,1fr)] lg:gap-8">
          {/* Member card */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <article className="relative rounded-[30px] bg-[#241711] text-white shadow-[0_28px_70px_-30px_rgba(43,27,20,0.75)]">
              <div
                aria-hidden
                className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_15%_0%,rgba(242,117,26,0.28),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(47,107,58,0.3),transparent_40%)]"
              />

              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <span
                    className={`${display.className} inline-flex items-center gap-2 text-lg font-extrabold`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8452C]">
                      <Pizza className="size-4" />
                    </span>
                    PizzaHub
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                    <BadgeCheck className="size-3" />
                    {roleLabel}
                  </span>
                </div>

                <div className="mt-8 flex flex-col items-center text-center">
                  <div
                    className="h-28 w-28 rounded-full p-[3px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] transition-all"
                    style={ringStyle}
                  >
                    <div className="h-full w-full rounded-full bg-[#241711] p-1.5">
                      <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-white/10">
                        <Avatar
                          src={form.image.trim()}
                          name={form.name}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("photo")
                              ?.scrollIntoView({ behavior: "smooth" })
                          }
                          className="absolute inset-0 flex items-center justify-center bg-[#2B1B14]/60 opacity-0 transition hover:opacity-100 focus-visible:opacity-100"
                          aria-label="Change profile photo"
                        >
                          <Camera className="size-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h2
                    className={`${display.className} mt-5 text-2xl font-extrabold leading-tight`}
                  >
                    {form.name.trim() || "Your name"}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-[#F2751A]">
                    {isVendor
                      ? form.businessName.trim() || "Your restaurant"
                      : isAdmin
                        ? "PizzaHub administrator"
                        : "PizzaHub customer"}
                  </p>

                  <p className="mt-2 flex max-w-full items-center gap-2 break-all text-xs text-white/60">
                    <Mail className="size-3.5 shrink-0" />
                    {saved.email}
                  </p>
                </div>
              </div>

              {/* Ticket perforation */}
              <div className="relative">
                <span className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#FFF8EC]" />

                <span className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-[#FFF8EC]" />

                <div className="border-t border-dashed border-white/20" />
              </div>

              <div className="relative space-y-4 p-6">
                <div className="flex items-start gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[#F2751A]">
                    <Phone className="size-4" />
                  </span>

                  <span className="min-w-0 break-words pt-1.5 text-white/80">
                    {form.phone.trim() || "No phone number yet"}
                  </span>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[#F2751A]">
                    <MapPin className="size-4" />
                  </span>

                  <span className="min-w-0 break-words pt-1.5 text-white/80">
                    {form.address.trim() || "No address yet"}
                  </span>
                </div>

                {isVendor && (
                  <>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[#F2751A]">
                        <Store className="size-4" />
                      </span>

                      <span className="min-w-0 break-words pt-1.5 text-white/80">
                        {form.businessLocation.trim() ||
                          "No restaurant location yet"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[#F2751A]">
                        <Clock className="size-4" />
                      </span>

                      <span className="min-w-0 break-words pt-1.5 text-white/80">
                        {form.openingHours.trim() || "No opening hours yet"}
                      </span>
                    </div>
                  </>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em]">
                    <span className="text-white/55">Profile strength</span>

                    <span className="text-[#F2751A]">
                      {completeness}%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2751A] to-[#E8452C] transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-4 text-white/45">
                    {remaining === 0
                      ? "Every required detail is filled in. Nicely done."
                      : `${remaining} required detail${remaining === 1 ? "" : "s"} left to complete your card.`}
                  </p>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Member since {memberSince}
                </p>
              </div>
            </article>

            {/* Role cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#2B1B14]/10 bg-white p-4 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2F6B3A]/10 text-[#2F6B3A]">
                  <BadgeCheck className="size-4" />
                </span>

                <p className="mt-2 text-xs font-extrabold text-[#2B1B14]">
                  Active
                </p>

                <p className="text-[11px] leading-4 text-[#7A6258]">
                  Account in good standing
                </p>
              </div>

              <div className="rounded-2xl border border-[#2B1B14]/10 bg-white p-4 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF0E8] text-[#E8452C]">
                  {isVendor ? (
                    <UtensilsCrossed className="size-4" />
                  ) : (
                    <ShoppingBag className="size-4" />
                  )}
                </span>

                <p className="mt-2 text-xs font-extrabold text-[#2B1B14]">
                  {roleLabel}
                </p>

                <p className="text-[11px] leading-4 text-[#7A6258]">
                  {isVendor ? "Restaurant partner" : "Pizza lover"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-[#F2751A]/25 bg-[#FFF0E8]/70 p-4">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[#E8452C]" />

              <p className="text-xs leading-5 text-[#5C443A]">
                {isVendor
                  ? "Restaurants with a photo and opening hours get more orders. Keep this card fresh."
                  : "A photo and phone number make pickups smoother — vendors know exactly who is arriving."}
              </p>
            </div>
          </aside>

          {/* Edit form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="relative rounded-[30px] border border-[#2B1B14]/10 bg-white shadow-[0_24px_60px_-40px_rgba(43,27,20,0.45)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#2B1B14]/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8452C]">
                  Edit profile
                </p>

                <h2
                  className={`${display.className} mt-1 text-xl font-extrabold text-[#2B1B14]`}
                >
                  {isVendor ? "Restaurant details" : "Personal details"}
                </h2>
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-[#FFF8EC] px-3 py-1.5 text-[11px] font-bold text-[#7A6258] sm:flex">
                <span
                  className={`h-2 w-2 rounded-full ${
                    dirty ? "bg-[#F2751A]" : "bg-[#2F6B3A]"
                  }`}
                />

                {dirty ? "Unsaved changes" : "All changes saved"}
              </div>
            </div>

            {/* Basics */}
            <section className="space-y-6 p-6 sm:p-8">
              <SectionHeading
                step="01"
                icon={User}
                title="The basics"
                description="Tell us who you are and how to reach you."
              />

              <Field
                label="Full name"
                htmlFor="name"
                error={shownErrors.name}
                required
              >
                <Input
                  id="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  aria-invalid={Boolean(shownErrors.name)}
                  aria-describedby={
                    shownErrors.name ? "name-error" : undefined
                  }
                  className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                  placeholder="Enter your full name"
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="email"
                hint="Locked to your login"
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A6258]/70" />

                  <Input
                    id="email"
                    value={saved.email}
                    disabled
                    className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFF8EC] pl-10 text-[#7A6258] opacity-100 disabled:opacity-100"
                  />
                </div>
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Phone number"
                  htmlFor="phone"
                  error={shownErrors.phone}
                  optional
                >
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="01XXXXXXXXX"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    aria-invalid={Boolean(shownErrors.phone)}
                    aria-describedby={
                      shownErrors.phone ? "phone-error" : undefined
                    }
                    className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                  />
                </Field>

                <Field
                  label="Address"
                  htmlFor="address"
                  error={shownErrors.address}
                  optional
                >
                  <Input
                    id="address"
                    autoComplete="street-address"
                    placeholder="House, road, area"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    aria-invalid={Boolean(shownErrors.address)}
                    aria-describedby={
                      shownErrors.address ? "address-error" : undefined
                    }
                    className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                  />
                </Field>
              </div>
            </section>

            <div className="mx-6 border-t border-[#2B1B14]/10 sm:mx-8" />

            {/* Bio */}
            <section className="space-y-6 p-6 sm:p-8">
              <SectionHeading
                step="02"
                icon={User}
                title="A little about you"
                description={
                  isVendor
                    ? "Share the personality behind your kitchen."
                    : "Add a short note to make your account feel like home."
                }
              />

              <Field
                label="About"
                htmlFor="bio"
                error={shownErrors.bio}
                hint={`${form.bio.length}/${BIO_LIMIT}`}
                optional
              >
                <Textarea
                  id="bio"
                  rows={4}
                  value={form.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  aria-invalid={Boolean(shownErrors.bio)}
                  aria-describedby={
                    shownErrors.bio ? "bio-error" : undefined
                  }
                  placeholder={
                    isVendor
                      ? "Tell customers what makes your restaurant special..."
                      : "Tell us about your favourite slice..."
                  }
                  className="min-h-32 resize-none rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 py-3 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                />
              </Field>
            </section>

            <div className="mx-6 border-t border-[#2B1B14]/10 sm:mx-8" />

            {/* Photo */}
            <section id="photo" className="scroll-mt-6 space-y-6 p-6 sm:p-8">
              <SectionHeading
                step="03"
                icon={Camera}
                title="Your look"
                description="Add a face to the name — or keep it beautifully blank."
              />

              <div className="rounded-2xl border border-[#2B1B14]/10 bg-[#FFFCF7] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#2B1B14]">
                      Profile photo
                    </p>

                    <p className="text-xs text-[#7A6258]">
                      {form.image.trim()
                        ? imageMode === "upload" &&
                          form.image.startsWith("data:")
                          ? "Uploaded and optimized automatically."
                          : "Using an image link."
                        : "No photo yet — your initials will shine instead."}
                    </p>
                  </div>

                  {form.image.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removePhoto}
                      className="h-9 rounded-xl border-[#E8452C]/20 text-[#C2331B] hover:bg-[#E8452C]/10 hover:text-[#C2331B]"
                    >
                      <Trash className="mr-1.5 size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="mt-4 inline-flex rounded-xl bg-[#2B1B14]/[0.06] p-1">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    aria-pressed={imageMode === "upload"}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      imageMode === "upload"
                        ? "bg-white text-[#2B1B14] shadow-sm"
                        : "text-[#7A6258] hover:text-[#2B1B14]"
                    }`}
                  >
                    <Upload className="size-3.5" />
                    Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageMode("link")}
                    aria-pressed={imageMode === "link"}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      imageMode === "link"
                        ? "bg-white text-[#2B1B14] shadow-sm"
                        : "text-[#7A6258] hover:text-[#2B1B14]"
                    }`}
                  >
                    <Link2 className="size-3.5" />
                    Use a link
                  </button>
                </div>

                {imageMode === "upload" ? (
                  <div
                    onDragEnter={(event) => {
                      event.preventDefault()
                      setDragging(true)
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${
                      dragging
                        ? "border-[#E8452C] bg-[#E8452C]/[0.06]"
                        : "border-[#2B1B14]/15 bg-white"
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#E8452C]">
                      {imageBusy ? (
                        <LoaderCircle className="size-5 animate-spin" />
                      ) : (
                        <ImagePlus className="size-5" />
                      )}
                    </span>

                    <p className="mt-3 text-sm font-bold text-[#2B1B14]">
                      {imageBusy
                        ? "Optimizing your photo..."
                        : dragging
                          ? "Drop it right here"
                          : "Drag a photo here"}
                    </p>

                    <p className="mt-1 text-xs text-[#7A6258]">
                      PNG, JPG or WebP · up to 6 MB
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageBusy}
                      className="mt-3 h-9 rounded-xl border-[#2B1B14]/15 bg-white px-4 font-bold"
                    >
                      <Upload className="mr-1.5 size-3.5" />
                      Choose a photo
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-label="Upload profile photo"
                    />

                    {shownErrors.image && (
                      <p
                        id="image-error"
                        role="alert"
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#C2331B]"
                      >
                        <TriangleAlert className="size-3.5 shrink-0" />
                        {shownErrors.image}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <Input
                      id="image"
                      type="url"
                      aria-label="Profile image URL"
                      placeholder="https://example.com/photo.jpg"
                      value={linkValue}
                      onChange={(event) =>
                        updateField("image", event.target.value)
                      }
                      aria-invalid={Boolean(shownErrors.image)}
                      aria-describedby={
                        shownErrors.image ? "image-error" : undefined
                      }
                      className="h-12 rounded-xl border-[#2B1B14]/10 bg-white px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                    />

                    {shownErrors.image && (
                      <p
                        id="image-error"
                        role="alert"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#C2331B]"
                      >
                        <TriangleAlert className="size-3.5 shrink-0" />
                        {shownErrors.image}
                      </p>
                    )}

                    <p className="text-[11px] leading-4 text-[#7A6258]">
                      Paste a public image link. Leave it empty to use your
                      initials.
                    </p>

                    {form.image.startsWith("data:") && (
                      <p className="text-[11px] font-semibold leading-4 text-[#E8452C]">
                        You currently have an uploaded photo. Typing a link
                        will replace it.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Vendor only */}
            {isVendor && (
              <>
                <div className="mx-6 border-t border-[#2B1B14]/10 sm:mx-8" />

                <section className="space-y-6 p-6 sm:p-8">
                  <SectionHeading
                    step="04"
                    icon={Store}
                    title="Your restaurant"
                    description="The storefront details customers look for before they order."
                  />

                  <Field
                    label="Restaurant name"
                    htmlFor="businessName"
                    error={shownErrors.businessName}
                    required
                  >
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={(event) =>
                        updateField("businessName", event.target.value)
                      }
                      aria-invalid={Boolean(shownErrors.businessName)}
                      aria-describedby={
                        shownErrors.businessName
                          ? "businessName-error"
                          : undefined
                      }
                      placeholder="Your restaurant name"
                      className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                    />
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      label="Location"
                      htmlFor="businessLocation"
                      error={shownErrors.businessLocation}
                      optional
                    >
                      <Input
                        id="businessLocation"
                        value={form.businessLocation}
                        onChange={(event) =>
                          updateField(
                            "businessLocation",
                            event.target.value
                          )
                        }
                        aria-invalid={Boolean(shownErrors.businessLocation)}
                        aria-describedby={
                          shownErrors.businessLocation
                            ? "businessLocation-error"
                            : undefined
                        }
                        placeholder="Gulshan, Dhaka"
                        className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                      />
                    </Field>

                    <Field
                      label="Opening hours"
                      htmlFor="openingHours"
                      error={shownErrors.openingHours}
                      optional
                    >
                      <Input
                        id="openingHours"
                        value={form.openingHours}
                        onChange={(event) =>
                          updateField(
                            "openingHours",
                            event.target.value
                          )
                        }
                        aria-invalid={Boolean(shownErrors.openingHours)}
                        aria-describedby={
                          shownErrors.openingHours
                            ? "openingHours-error"
                            : undefined
                        }
                        placeholder="10 AM – 11 PM"
                        className="h-12 rounded-xl border-[#2B1B14]/10 bg-[#FFFCF7] px-3.5 text-[#2B1B14] focus-visible:border-[#E8452C] focus-visible:ring-[#E8452C]/15"
                      />
                    </Field>
                  </div>
                </section>
              </>
            )}

            {/* Actions */}
            <div className="sticky bottom-0 z-20 rounded-b-[30px] border-t border-[#2B1B14]/10 bg-white/95 px-6 py-4 backdrop-blur sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {feedback ? (
                  <div
                    aria-live="polite"
                    className={`flex max-w-xl items-start gap-2 text-xs font-semibold leading-5 ${
                      feedback.type === "success"
                        ? "text-[#24512C]"
                        : "text-[#A52A15]"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CircleCheck className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                    )}

                    <span>
                      <span className="font-extrabold">
                        {feedback.title}.
                      </span>{" "}
                      {feedback.message}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6258]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        dirty ? "bg-[#F2751A]" : "bg-[#2F6B3A]"
                      }`}
                    />

                    {saving
                      ? "Saving your changes..."
                      : dirty
                        ? "You have unsaved changes."
                        : "Everything is up to date."}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={discardChanges}
                    disabled={!dirty || saving || imageBusy}
                    className="h-11 rounded-xl border-[#2B1B14]/15 px-4 font-bold"
                  >
                    <RotateCcw className="mr-1.5 size-4" />
                    Discard
                  </Button>

                  <Button
                    type="submit"
                    disabled={!dirty || saving || imageBusy}
                    className="h-11 rounded-xl bg-[#E8452C] px-6 font-bold text-white shadow-[0_10px_24px_-12px_rgba(232,69,44,0.9)] hover:bg-[#C2331B]"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle className="mr-1.5 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : imageBusy ? (
                      <>
                        <LoaderCircle className="mr-1.5 size-4 animate-spin" />
                        Processing photo...
                      </>
                    ) : (
                      <>
                        <Save className="mr-1.5 size-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
