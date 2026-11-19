"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"
import { toast } from "react-toastify"
import { Bricolage_Grotesque } from "next/font/google"

import { addItem } from "@/lib/vendor-menu-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const display = Bricolage_Grotesque({ subsets: ["latin"] })

// Change these to match your PizzaHub categories
const CATEGORIES = ["Pizza", "Burger", "Pasta", "Sides", "Dessert", "Drinks"]

type AddForm = {
  name: string
  category: string
  price: string
  location: string
  description: string
  image: string
}

type FormErrors = Partial<Record<keyof AddForm, string>>

const emptyForm: AddForm = {
  name: "",
  category: "",
  price: "",
  location: "",
  description: "",
  image: "",
}

function validate(form: AddForm): FormErrors {
  const errors: FormErrors = {}

  if (form.name.trim().length < 3) errors.name = "Enter at least 3 characters."
  if (!form.category) errors.category = "Pick a category."
  if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0)
    errors.price = "Enter a price above 0."
  if (!form.location.trim()) errors.location = "Enter where this item is served."
  if (!form.description.trim()) errors.description = "Add a short description."

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
      {error ? (
        <p role="alert" className="text-sm text-[#C2331B]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-[#7A6258]">{hint}</p>
      ) : null}
    </div>
  )
}

export default function AddMenuPage() {
  const router = useRouter()

  const [form, setForm] = useState<AddForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const errors = validate(form)
  const shown: FormErrors = submitted ? errors : {}

  const priceNumber = Number(form.price)
  const hasPrice = Number.isFinite(priceNumber) && priceNumber > 0
  const hasImage = form.image.trim() !== "" && !imageFailed

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) return

    setSubmitted(true)

    if (Object.keys(errors).length > 0) {
      toast.error("Check the highlighted fields.")
      return
    }

    try {
      setSaving(true)

      await addItem({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        location: form.location.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
      })

      toast.success("Item added. It will appear on your menu after approval.")
      router.push("/dashboard/vendor/menu")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not add menu item."
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
          <h1
            className={`${display.className} text-4xl font-extrabold tracking-tight text-[#2B1B14] sm:text-5xl`}
          >
            Add a menu item
          </h1>
          <p className="mt-3 text-base text-[#7A6258]">
            Fill in the details and watch the preview update. New items go live
            after approval.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="divide-y divide-[#2B1B14]/10 rounded-3xl bg-white px-6 shadow-[0_1px_0_0_rgba(43,27,20,0.06)] sm:px-8"
          >
            {/* Basics */}
            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">Basics</h2>

              <Field label="Name" htmlFor="add-name" error={shown.name}>
                <Input
                  id="add-name"
                  placeholder="Chicken supreme pizza"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!shown.name}
                  className="h-11 bg-white"
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
                        onClick={() => setForm({ ...form, category })}
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

            {/* Details */}
            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">Details</h2>

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
                        setForm({ ...form, price: e.target.value })
                      }
                      aria-invalid={!!shown.price}
                      className="h-11 bg-white pl-8"
                    />
                  </div>
                </Field>

                <Field
                  label="Location"
                  htmlFor="add-location"
                  error={shown.location}
                >
                  <Input
                    id="add-location"
                    placeholder="Dhanmondi, Dhaka"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
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
                    setForm({ ...form, description: e.target.value })
                  }
                  aria-invalid={!!shown.description}
                  className="bg-white"
                />
              </Field>
            </section>

            {/* Photo */}
            <section className="space-y-6 py-7">
              <h2 className="text-lg font-bold text-[#2B1B14]">Photo</h2>

              <Field
                label="Image link"
                htmlFor="add-image"
                hint="Optional. Paste a link to a photo and it shows in the preview."
              >
                <Input
                  id="add-image"
                  type="url"
                  placeholder="https://"
                  value={form.image}
                  onChange={(e) => {
                    setImageFailed(false)
                    setForm({ ...form, image: e.target.value })
                  }}
                  className="h-11 bg-white"
                />
              </Field>
            </section>

            {/* Actions */}
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
                disabled={saving}
                className="h-11 bg-[#E8452C] px-8 text-white hover:bg-[#C2331B]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add item"
                )}
              </Button>
            </div>
          </form>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-8" aria-label="Menu item preview">
            <p className="mb-3 text-sm font-medium text-[#7A6258]">
              How customers will see it
            </p>

            <div className="overflow-hidden rounded-3xl bg-[#2B1B14] text-[#FFF8EC] shadow-[0_24px_48px_-20px_rgba(43,27,20,0.55)]">
              <div className="relative aspect-[4/3] bg-[#3B281F]">
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image.trim()}
                    alt={form.name.trim() || "Menu item photo"}
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#FFF8EC]/60">
                    {imageFailed
                      ? "That link didn't load a photo. Check it and try again."
                      : "Your photo appears here"}
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
                  {form.description.trim() ||
                    "Your description appears here."}
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