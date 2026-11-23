
"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MapPin,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "react-toastify"
import { Bricolage_Grotesque } from "next/font/google"

import {
  addItem,
  uploadMenuImage,
  BASE_URL,
} from "@/lib/vendor-menu-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

const CATEGORIES = [
  "Pizza",
  "Burger",
  "Pasta",
  "Sides",
  "Dessert",
  "Drinks",
]

type AddForm = {
  name: string
  category: string
  price: string
  location: string
  description: string
  imageFile: File | null
}

type FormErrors = Partial<Record<keyof AddForm, string>>

const emptyForm: AddForm = {
  name: "",
  category: "",
  price: "",
  location: "",
  description: "",
  imageFile: null,
}

function validate(form: AddForm): FormErrors {
  const errors: FormErrors = {}

  if (form.name.trim().length < 3) {
    errors.name = "Enter at least 3 characters."
  }

  if (!form.category) {
    errors.category = "Pick a category."
  }

  if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
    errors.price = "Enter a price above 0."
  }

  if (!form.location.trim()) {
    errors.location = "Enter an area or city."
  }

  if (!form.description.trim()) {
    errors.description = "Add a short description."
  }

  if (!form.imageFile) {
    errors.imageFile = "Upload an item image as a file."
  }

  return errors
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[#2B1B14]">
        {label}
      </Label>

      {children}

      {error && (
        <p role="alert" className="text-sm text-[#C2331B]">
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="text-sm text-[#7A6258]">{hint}</p>
      )}
    </div>
  )
}

export default function AddMenuPage() {
  const router = useRouter()

  const [form, setForm] = useState<AddForm>(emptyForm)
  const [businessName, setBusinessName] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")

  const previewUrlRef = useRef("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = validate(form)
  const shown: FormErrors = submitted ? errors : {}

  const priceNumber = Number(form.price)
  const hasPrice = Number.isFinite(priceNumber) && priceNumber > 0
  const hasImage = Boolean(form.imageFile) && previewUrl !== ""

  

  // Load vendor business name
  useEffect(() => {
  let isMounted = true

  async function getBusinessName() {
    try {
      const sessionResult = await authClient.getSession()

      const email = sessionResult.data?.user?.email
      const token = sessionResult.data?.session?.token

      if (!email || !token) {
        throw new Error("Please log in again.")
      }

      const profileRes = await fetch(
        `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      )

      const profileData = await profileRes.json()

      if (!profileRes.ok) {
        throw new Error(
          profileData.message || "Could not load vendor profile."
        )
      }

      if (!profileData.businessName) {
        throw new Error(
          "Business name not found. Please update your vendor profile."
        )
      }

      if (isMounted) {
        setBusinessName(profileData.businessName)
      }
    } catch (error) {
      console.error("Business name error:", error)

      if (isMounted) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load business name."
        )
      }
    } finally {
      if (isMounted) {
        setLoadingProfile(false)
      }
    }
  }

  getBusinessName()

  return () => {
    isMounted = false
  }
}, [])

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  function updatePreview(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const url = file ? URL.createObjectURL(file) : ""

    previewUrlRef.current = url
    setPreviewUrl(url)
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a JPG, PNG or WebP image.")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.")
      e.target.value = ""
      return
    }

    updatePreview(file)

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }))
  }

  function removeImage() {
    updatePreview(null)

    setForm((prev) => ({
      ...prev,
      imageFile: null,
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()

  if (saving) return

  setSubmitted(true)

  if (Object.keys(errors).length > 0) {
    toast.error("Check the highlighted fields.")
    return
  }

  if (loadingProfile) {
    toast.info("Please wait. Loading your business name.")
    return
  }

  if (!businessName.trim()) {
    toast.error("Business name not found. Please check your profile.")
    return
  }

  if (!form.imageFile) return

  try {
    setSaving(true)

    // 1. Get authenticated vendor session
    const sessionResult = await authClient.getSession()

    const email = sessionResult.data?.user?.email
    const token = sessionResult.data?.session?.token

    if (!email || !token) {
      throw new Error("Your session has expired. Please log in again.")
    }

    // 2. Get the latest vendor profile
    const profileRes = await fetch(
      `${BASE_URL}/vendor-profile/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    )

    const profileData = await profileRes.json()

    if (!profileRes.ok) {
      throw new Error(
        profileData.message || "Could not verify your vendor profile."
      )
    }

    const profileBusinessName = profileData.businessName?.trim()

    if (!profileBusinessName) {
      throw new Error("Business name is missing from your vendor profile.")
    }

    // 3. Compare business names
    if (
      profileBusinessName.toLowerCase() !==
      businessName.trim().toLowerCase()
    ) {
      setBusinessName(profileBusinessName)

      toast.error(
        "Business name changed. Please check the updated name and try again."
      )

      return
    }

    // 4. Upload image
    const imageUrl = await uploadMenuImage(form.imageFile)

    if (!imageUrl) {
      throw new Error("Image upload failed.")
    }

    // 5. Create the menu item (the helper attaches the session token)
    await addItem({
      email,
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      location: form.location.trim(),
      description: form.description.trim(),
      image: imageUrl,
      businessName: profileBusinessName,
    })

    toast.success("Item added. It will appear after approval.")

    router.push("/dashboard/vendor/menu")
    router.refresh()
  } catch (error) {
    console.error("Add menu item error:", error)

    toast.error(
      error instanceof Error
        ? error.message
        : "Could not add menu item."
    )
  } finally {
    setSaving(false)
  }
}


  return (
    <div className="min-h-screen bg-[#FFF8EC] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#7A6258] transition-colors hover:text-[#E8452C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E8452C]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my menu
        </button>

        <header className="mb-8 max-w-xl">
          <h1 className={`${display.className} text-4xl font-extrabold tracking-tight text-[#2B1B14] sm:text-5xl`}>
            Add a menu item
          </h1>

          <p className="mt-3 text-base text-[#7A6258]">
            Fill in the details and watch the preview update. New items go
            live after approval.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">

          <form
            onSubmit={handleSubmit}
            noValidate
            className="divide-y divide-[#2B1B14]/10 rounded-3xl bg-white px-6 shadow-[0_1px_0_0_rgba(43,27,20,0.06)] sm:px-8"
          >

            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">
                Basics
              </h2>

              <Field label="Item Name" htmlFor="add-name" error={shown.name}>
                <Input
                  id="add-name"
                  placeholder="Chicken supreme pizza"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  aria-invalid={!!shown.name}
                  className="h-11 bg-white"
                />
              </Field>

              <Field label="Business Name">
                <Input
                  value={businessName}
                  readOnly
                  placeholder={
                    loadingProfile
                      ? "Loading business name..."
                      : "Business name not available"
                  }
                  className="h-11 bg-gray-100 font-medium"
                />
              </Field>

              <Field label="Category" error={shown.category}>
                <div
                  role="radiogroup"
                  aria-label="Category"
                  className="flex flex-wrap gap-2"
                >
                  {CATEGORIES.map((category) => {
                    const selected = form.category === category

                    return (
                      <button
                        key={category}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, category }))
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8452C] ${
                          selected
                            ? "border-[#E8452C] bg-[#E8452C] text-white"
                            : "border-[#2B1B14]/20 bg-white text-[#2B1B14] hover:border-[#E8452C] hover:text-[#E8452C]"
                        }`}
                      >
                        {category}
                      </button>
                    )
                  })}
                </div>
              </Field>
            </section>

            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">
                Details
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Price" htmlFor="add-price" error={shown.price}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#E8452C]">
                      ৳
                    </span>

                    <Input
                      id="add-price"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="450"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      aria-invalid={!!shown.price}
                      className="h-11 bg-white pl-8"
                    />
                  </div>
                </Field>

                <Field
                  label="Location (area / city)"
                  htmlFor="add-location"
                  error={shown.location}
                >
                  <Input
                    id="add-location"
                    placeholder="Dhanmondi, Dhaka"
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    aria-invalid={!!shown.location}
                    className="h-11 bg-white"
                  />
                </Field>
              </div>

              <Field
                label="Description"
                htmlFor="add-description"
                error={shown.description}
              >
                <Textarea
                  id="add-description"
                  rows={4}
                  placeholder="Hand-stretched dough, mozzarella, grilled chicken and roasted peppers."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  aria-invalid={!!shown.description}
                  className="bg-white"
                />
              </Field>
            </section>

            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">
                Photo
              </h2>

              <Field
                label="Item Image"
                htmlFor="add-image"
                error={shown.imageFile}
                hint="Required. JPG, PNG or WebP, up to 5 MB. Stored on ImgBB."
              >
                <input
                  ref={fileInputRef}
                  id="add-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />

                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#2B1B14]/20 bg-[#FFFCF7] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Selected item photo"
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8452C]/10 text-[#E8452C]">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2B1B14]">
                        {form.imageFile?.name || "No photo chosen"}
                      </p>

                      <p className="text-xs text-[#7A6258]">
                        {form.imageFile
                          ? `${(form.imageFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : "Upload a clear photo of this item"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {form.imageFile ? "Replace" : "Choose photo"}
                    </Button>

                    {form.imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeImage}
                        aria-label="Remove photo"
                        className="h-10 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Field>
            </section>

            <div className="flex flex-col-reverse gap-3 py-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => router.back()}
                className="h-11 px-6"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || loadingProfile}
                className="h-11 bg-[#E8452C] px-8 text-white hover:bg-[#C2331B]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : loadingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading profile...
                  </>
                ) : (
                  "Add item"
                )}
              </Button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-8" aria-label="Menu item preview">
            <p className="mb-3 text-sm font-medium text-[#7A6258]">
              How customers will see it
            </p>

            <div className="overflow-hidden rounded-3xl bg-[#2B1B14] text-[#FFF8EC] shadow-[0_24px_48px_-20px_rgba(43,27,20,0.55)]">
              <div className="relative aspect-[4/3] bg-[#3B281F]">
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={form.name.trim() || "Menu item photo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#FFF8EC]/60">
                    Your photo appears here
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3
                    className={`${display.className} text-2xl font-extrabold leading-tight ${
                      form.name.trim() ? "" : "text-[#FFF8EC]/40"
                    }`}
                  >
                    {form.name.trim() || "Item name"}
                  </h3>

                  <p
                    className={`${display.className} shrink-0 text-2xl font-extrabold ${
                      hasPrice ? "text-[#F2751A]" : "text-[#FFF8EC]/40"
                    }`}
                  >
                    ৳{hasPrice ? priceNumber.toFixed(2) : "0.00"}
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#F2751A]">
                  {businessName || "Business name"}
                </p>

                <p className="text-sm text-[#FFF8EC]/70">
                  {form.category || "Category"}
                </p>

                <p className="flex items-center gap-1.5 text-sm text-[#FFF8EC]/70">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {form.location.trim() || "Location"}
                </p>

                <p
                  className={`text-sm leading-relaxed ${
                    form.description.trim()
                      ? "text-[#FFF8EC]/85"
                      : "text-[#FFF8EC]/40"
                  }`}
                >
                  {form.description.trim() || "Your description appears here."}
                </p>
              </div>

              <div className="border-t-2 border-dashed border-[#FFF8EC]/25 px-5 py-3.5 text-sm text-[#FFF8EC]/70">
                Pending review. This item goes live after approval.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
