
"use client"
import { ToastContainer, toast } from 'react-toastify';
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
    AlertCircle,
    CheckCircle2,
    Circle,
    ImageIcon,
    Loader2,
    MapPin,
    Sparkles,
    UploadCloud,
    X,
} from "lucide-react"

import { createMenuItem } from "@/lib/menu-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

/* ============================================================
   PART 1: SETTINGS
   ============================================================ */

const CURRENCY = "$"
const MAX_IMAGE_MB = 5
const DESCRIPTION_MAX = 300
const AFTER_SAVE_URL = "/dashboard/menu"

const categories = [
    { label: "Classic Pizzas", emoji: "🍕" },
    { label: "Veggie Pizzas", emoji: "🥬" },
    { label: "Meat Lovers", emoji: "🍖" },
    { label: "Spicy Pizzas", emoji: "🌶️" },
    { label: "Drinks & Sides", emoji: "🥤" },
]

const inputClass =
    "h-12 rounded-xl border-[#1F2A1F]/15 bg-[#FFF8EC]/60 focus-visible:ring-[#2F6B3A]/30"

const stripeStyle = {
    backgroundImage:
        "repeating-linear-gradient(90deg, #E8452C 0 12px, #FFF8EC 12px 24px)",
}

/* ============================================================
   PART 2: SMALL BUILDING BLOCKS
   ============================================================ */

// ---------- Pizza maths helpers ----------

function pointOnCircle(angle: number, radius: number) {
    const radians = ((angle - 90) * Math.PI) / 180

    return {
        x: Number((200 + radius * Math.cos(radians)).toFixed(2)),
        y: Number((200 + radius * Math.sin(radians)).toFixed(2)),
    }
}

function slicePath(index: number, radius: number, count: number) {
    const sliceAngle = 360 / count
    const gap = 1.5

    const start = pointOnCircle(index * sliceAngle + gap, radius)
    const end = pointOnCircle((index + 1) * sliceAngle - gap, radius)

    return `M 200 200 L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`
}

// ---------- Pizza builder ----------

function PizzaBuilder({
    done,
    className,
}: {
    done: boolean[]
    className?: string
}) {
    const count = done.length

    return (
        <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
            {done.map((isDone, index) => {
                const sliceAngle = 360 / count
                const bigPepperoni = pointOnCircle(
                    index * sliceAngle + sliceAngle / 2,
                    108
                )
                const smallPepperoni = pointOnCircle(
                    index * sliceAngle + sliceAngle / 2,
                    58
                )

                return (
                    <g
                        key={index}
                        style={{
                            opacity: isDone ? 1 : 0.2,
                            transform: isDone ? "scale(1)" : "scale(0.94)",
                            transformOrigin: "200px 200px",
                            transition: "all 500ms ease",
                        }}
                    >
                        <path d={slicePath(index, 190, count)} fill="#E9A94B" />
                        <path d={slicePath(index, 165, count)} fill="#C93A22" />
                        <path d={slicePath(index, 150, count)} fill="#FFD66B" />

                        <circle
                            cx={bigPepperoni.x}
                            cy={bigPepperoni.y}
                            r="20"
                            fill="#C0301C"
                        />

                        <circle
                            cx={smallPepperoni.x}
                            cy={smallPepperoni.y}
                            r="12"
                            fill="#C0301C"
                        />
                    </g>
                )
            })}
        </svg>
    )
}

// ---------- Banner ----------

function Banner({ done }: { done: boolean[] }) {
    const doneCount = done.filter(Boolean).length
    const allDone = doneCount === done.length

    return (
        <div
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-10"
            style={{
                backgroundImage: "linear-gradient(135deg, #E8452C, #F2751A)",
            }}
        >
            <div
                className="absolute inset-0 opacity-70"
                style={{
                    backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,0.12) 50%, transparent 50%), linear-gradient(rgba(255,255,255,0.12) 50%, transparent 50%)",
                    backgroundSize: "56px 56px",
                }}
            />

            <div className="relative flex items-center justify-between gap-6">
                <div className="max-w-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                        <Sparkles className="h-3.5 w-3.5" />
                        New item
                    </span>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        Add a menu item
                    </h1>

                    <p className="mt-3 text-sm text-white/85 sm:text-base">
                        Every part you fill in adds a slice to the pizza. Fill them all
                        and it is ready to bake!
                    </p>

                    <span className="mt-5 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#E8452C] shadow">
                        {allDone
                            ? "Ready to bake! 🍕"
                            : `${doneCount} of ${done.length} slices ready`}
                    </span>
                </div>

                <PizzaBuilder
                    done={done}
                    className="h-28 w-28 shrink-0 drop-shadow-2xl sm:h-48 sm:w-48 lg:h-60 lg:w-60"
                />
            </div>
        </div>
    )
}

// ---------- Section ----------

function Section({
    step,
    title,
    subtitle,
    children,
}: {
    step: number
    title: string
    subtitle: string
    children: ReactNode
}) {
    return (
        <section className="overflow-hidden rounded-3xl border border-[#1F2A1F]/10 bg-white shadow-sm">
            <div className="h-2" style={stripeStyle} />

            <div className="p-5 sm:p-7">
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2F6B3A] text-base font-extrabold text-white">
                        {step}
                    </span>

                    <div>
                        <h2 className="text-base font-bold text-[#1F2A1F]">
                            {title}
                        </h2>
                        <p className="text-xs text-[#1F2A1F]/50">{subtitle}</p>
                    </div>
                </div>

                {children}
            </div>
        </section>
    )
}

// ---------- Field ----------

function Field({
    label,
    htmlFor,
    error,
    hint,
    children,
}: {
    label: string
    htmlFor: string
    error?: string
    hint?: string
    children: ReactNode
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between">
                <Label
                    htmlFor={htmlFor}
                    className="text-sm font-semibold text-[#1F2A1F]"
                >
                    {label} <span className="text-[#E8452C]">*</span>
                </Label>

                {hint && (
                    <span className="text-xs text-[#1F2A1F]/50">{hint}</span>
                )}
            </div>

            {children}

            {error && (
                <p className="text-xs font-medium text-[#E8452C]">{error}</p>
            )}
        </div>
    )
}

// ---------- Photo uploader ----------

function PhotoUploader({
    preview,
    hasError,
    onPick,
    onRemove,
}: {
    preview: string | null
    hasError: boolean
    onPick: (file?: File) => void
    onRemove: () => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    let boxColors =
        "border-[#1F2A1F]/20 bg-[#FFF8EC]/60 hover:border-[#2F6B3A]"

    if (hasError) {
        boxColors = "border-[#E8452C]/60 bg-[#FFF8EC]/60"
    }

    if (isDragging) {
        boxColors = "border-[#E8452C] bg-[#E8452C]/10"
    }

    function openFilePicker() {
        fileInputRef.current?.click()
    }

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openFilePicker()
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    onPick(e.dataTransfer.files?.[0])
                }}
                className={`relative flex min-h-60 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${boxColors}`}
            >
                {preview ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Selected item"
                            className="h-72 w-full object-cover"
                        />

                        <button
                            type="button"
                            aria-label="Remove image"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemove()
                            }}
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1F2A1F] shadow hover:bg-white"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                            Click to change
                        </span>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8452C]/10 text-[#E8452C]">
                            <UploadCloud className="h-7 w-7" />
                        </span>

                        <p className="text-sm font-semibold text-[#1F2A1F]">
                            Drop your photo here, or{" "}
                            <span className="text-[#E8452C]">browse</span>
                        </p>

                        <p className="text-xs text-[#1F2A1F]/50">
                            JPG, PNG or WebP
                        </p>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                    onPick(e.target.files?.[0])
                    e.target.value = ""
                }}
            />
        </>
    )
}

// ---------- Preview card ----------

function PreviewCard({
    preview,
    name,
    category,
    price,
    location,
    description,
}: {
    preview: string | null
    name: string
    category: string
    price: string
    location: string
    description: string
}) {
    const categoryInfo = categories.find((c) => c.label === category)
    const shownPrice =
        Number(price) > 0 ? Number(price).toFixed(2) : "0.00"

    return (
        <div className="overflow-hidden rounded-3xl border border-[#1F2A1F]/10 bg-white shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-1">
            <div className="h-2" style={stripeStyle} />

            <div className="relative aspect-[4/3] bg-[#FFF8EC]">
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[#1F2A1F]/30">
                        <ImageIcon className="h-12 w-12" />
                        <span className="text-xs">
                            Your photo will appear here
                        </span>
                    </div>
                )}

                {categoryInfo && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#2F6B3A] shadow">
                        {categoryInfo.emoji} {categoryInfo.label}
                    </span>
                )}
            </div>

            <div className="space-y-2 p-5">
                <h2 className="text-xl font-extrabold leading-snug text-[#1F2A1F]">
                    {name.trim() || "Item name"}
                </h2>

                <p className="line-clamp-3 text-sm leading-relaxed text-[#1F2A1F]/60">
                    {description.trim() ||
                        "Your description will show up here as you type."}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-[#1F2A1F]/15 bg-[#FFF8EC] px-5 py-4">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#1F2A1F]/40">
                        PRICE
                    </p>
                    <p className="text-2xl font-extrabold text-[#E8452C]">
                        {CURRENCY}
                        {shownPrice}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#1F2A1F]/40">
                        LOCATION
                    </p>
                    <p className="flex items-center justify-end gap-1 text-sm font-semibold text-[#2F6B3A]">
                        <MapPin className="h-3.5 w-3.5" />
                        {location.trim() || "Area, City"}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ---------- Checklist ----------

function Checklist({
    items,
}: {
    items: { label: string; done: boolean }[]
}) {
    const doneCount = items.filter((item) => item.done).length

    return (
        <div className="mt-6 rounded-2xl bg-white/70 p-4">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1F2A1F]">
                    Before you publish
                </p>

                <span className="text-xs font-semibold text-[#2F6B3A]">
                    {doneCount}/{items.length} done
                </span>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                    <li
                        key={item.label}
                        className={`flex items-center gap-2 text-sm ${item.done
                                ? "font-semibold text-[#2F6B3A]"
                                : "text-[#1F2A1F]/50"
                            }`}
                    >
                        {item.done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                        ) : (
                            <Circle className="h-4 w-4 shrink-0" />
                        )}

                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}

/* ============================================================
   PART 3: MAIN PAGE
   ============================================================ */

export default function NewMenuItemPage() {
    const router = useRouter()

    const [values, setValues] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        location: "",
    })

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSaving, setIsSaving] = useState(false)

    const [message, setMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    // Clean up temporary image preview URLs.
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview)
            }
        }
    }, [preview])

    // ---------- Handle text inputs ----------

    function handleChange(
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target

        setValues((previous) => ({
            ...previous,
            [name]: value,
        }))

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }))
    }

    // ---------- Handle category ----------

    function handleCategoryChange(value: string | null) {
        setValues((previous) => ({
            ...previous,
            category: value ?? "",
        }))

        setErrors((previous) => ({
            ...previous,
            category: "",
        }))
    }

    // ---------- Handle image selection ----------

    function handlePickFile(picked?: File) {
        if (!picked) return

        if (!picked.type.startsWith("image/")) {
            setErrors((previous) => ({
                ...previous,
                image: "Please choose an image file (JPG, PNG, WebP).",
            }))
            return
        }

        if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
            setErrors((previous) => ({
                ...previous,
                image: `Image must be smaller than ${MAX_IMAGE_MB} MB.`,
            }))
            return
        }

        setFile(picked)
        setPreview(URL.createObjectURL(picked))

        setErrors((previous) => ({
            ...previous,
            image: "",
        }))
    }

    // ---------- Remove selected image ----------

    function handleRemoveFile() {
        setFile(null)
        setPreview(null)

        setErrors((previous) => ({
            ...previous,
            image: "",
        }))
    }

    // ---------- Validate form ----------

    function validate() {
        const newErrors: Record<string, string> = {}

        if (values.name.trim().length < 3) {
            newErrors.name = "Enter at least 3 characters."
        }

        if (!values.category) {
            newErrors.category = "Choose a category."
        }

        if (
            !values.price ||
            !Number.isFinite(Number(values.price)) ||
            Number(values.price) <= 0
        ) {
            newErrors.price = "Enter a price above 0."
        }

        if (!values.location.trim()) {
            newErrors.location = "Enter an area or city."
        }

        if (values.description.trim().length < 10) {
            newErrors.description = "Write at least 10 characters."
        }

        if (!file) {
            newErrors.image = "An item image is required."
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    // ---------- Submit form ----------

    //   async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    //     e.preventDefault()

    //     setMessage(null)

    //     if (isSaving) return

    //     if (!validate() || !file) return

    //     setIsSaving(true)

    //     try {
    //       // Prepare form data, including the image file.
    //       const formData = new FormData()

    //       formData.append("name", values.name.trim())
    //       formData.append("category", values.category)
    //       formData.append("description", values.description.trim())
    //       formData.append("price", values.price)
    //       formData.append("location", values.location.trim())
    //       formData.append("image", file)

    //       // Send the form data through the separate API helper.
    //     //   const result = await createMenuItem(formData)

    //     //   setMessage({

    //     //   })

    //       // Redirect after successful saving.
    //       setTimeout(() => {
    //         // router.push(AFTER_SAVE_URL)
    //         //router.refresh()
    //       }, 1000)
    //     } catch (error) {
    //       console.error("SAVE MENU ERROR:", error)

    //       setMessage({
    //         type: "error",
    //         text:
    //           error instanceof Error
    //             ? error.message
    //             : "Could not save the menu item. Please try again.",
    //       })
    //     } finally {
    //       setIsSaving(false)
    //     }
    //   }
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (isSaving) return

        if (!validate() || !file) return

        setIsSaving(true)

        try {
            const formData = new FormData()

            formData.append("name", values.name.trim())
            formData.append("category", values.category)
            formData.append("description", values.description.trim())
            formData.append("price", values.price)
            formData.append("location", values.location.trim())
            formData.append("image", file)

            // Save menu item to MongoDB
            const result = await createMenuItem(formData)

            // Show success toast
            toast.success(result?.message || "Pizza added successfully! 🍕")

            // Redirect after showing toast
            setTimeout(() => {
                // router.push(AFTER_SAVE_URL)
                // router.refresh()
            }, 1500)

        } catch (error) {
            console.error("SAVE MENU ERROR:", error)

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not save the menu item. Please try again."
            )
        } finally {
            setIsSaving(false)
        }
    }

    // ---------- Checklist data ----------

    const checklistItems = [
        { label: "Photo added", done: file !== null },
        { label: "Item name", done: values.name.trim().length >= 3 },
        { label: "Category chosen", done: values.category !== "" },
        { label: "Price set", done: Number(values.price) > 0 },
        { label: "Location added", done: values.location.trim() !== "" },
        {
            label: "Description written",
            done: values.description.trim().length >= 10,
        },
    ]

    /* ============================================================
       PART 4: PAGE UI
       ============================================================ */

    return (
        <div className="min-h-screen w-full bg-[#FFF8EC]">
            <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

                <Banner done={checklistItems.map((item) => item.done)} />

                <div className="grid gap-6 lg:grid-cols-12">

                    {/* LEFT SIDE: FORM */}

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="space-y-6 lg:col-span-7"
                    >

                        {/* Section 1: Photo */}

                        <Section
                            step={1}
                            title="Item photo"
                            subtitle="A good photo sells the pizza."
                        >
                            <Field
                                label="Item Image"
                                htmlFor="image"
                                error={errors.image}
                                hint={`Max ${MAX_IMAGE_MB} MB`}
                            >
                                <PhotoUploader
                                    preview={preview}
                                    hasError={!!errors.image}
                                    onPick={handlePickFile}
                                    onRemove={handleRemoveFile}
                                />
                            </Field>
                        </Section>

                        {/* Section 2: Basic information */}

                        <Section
                            step={2}
                            title="Basic info"
                            subtitle="Name, category and price."
                        >
                            <div className="space-y-6">

                                <Field
                                    label="Item Name"
                                    htmlFor="name"
                                    error={errors.name}
                                >
                                    <Input
                                        id="name"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Smoky Pepperoni Supreme"
                                        className={inputClass}
                                    />
                                </Field>

                                <div className="grid gap-6 sm:grid-cols-2">

                                    <Field
                                        label="Category"
                                        htmlFor="category"
                                        error={errors.category}
                                    >
                                        <Select
                                            value={values.category}
                                            onValueChange={handleCategoryChange}
                                        >
                                            <SelectTrigger
                                                id="category"
                                                className={`${inputClass} w-full`}
                                            >
                                                <SelectValue placeholder="Choose a category" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.label}
                                                        value={category.label}
                                                    >
                                                        {category.emoji} {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field
                                        label="Price"
                                        htmlFor="price"
                                        error={errors.price}
                                    >
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1F2A1F]/50">
                                                {CURRENCY}
                                            </span>

                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="0.01"
                                                value={values.price}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className={`${inputClass} pl-8`}
                                            />
                                        </div>
                                    </Field>

                                </div>
                            </div>
                        </Section>

                        {/* Section 3: Location and description */}

                        <Section
                            step={3}
                            title="Where & what"
                            subtitle="Where it is sold and what is in it."
                        >
                            <div className="space-y-6">

                                <Field
                                    label="Location (area / city)"
                                    htmlFor="location"
                                    error={errors.location}
                                >
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F6B3A]" />

                                        <Input
                                            id="location"
                                            name="location"
                                            value={values.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Gulshan, Dhaka"
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label="Description"
                                    htmlFor="description"
                                    error={errors.description}
                                    hint={`${values.description.length}/${DESCRIPTION_MAX}`}
                                >
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={values.description}
                                        onChange={handleChange}
                                        maxLength={DESCRIPTION_MAX}
                                        rows={4}
                                        placeholder="Describe the toppings, crust, size, and flavor..."
                                        className="rounded-xl border-[#1F2A1F]/15 bg-[#FFF8EC]/60 focus-visible:ring-[#2F6B3A]/30"
                                    />
                                </Field>

                            </div>
                        </Section>

                        {/* Success or error message */}

                        {message && (
                            <div
                                role="status"
                                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${message.type === "success"
                                        ? "bg-[#2F6B3A]/10 text-[#2F6B3A]"
                                        : "bg-[#E8452C]/10 text-[#E8452C]"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                )}

                                {message.text}
                            </div>
                        )}

                        {/* Buttons */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSaving}
                                onClick={() => router.back()}
                                className="h-12 rounded-full border-[#1F2A1F]/20 bg-white px-7 font-semibold"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="h-12 rounded-full bg-[#E8452C] px-10 font-bold text-white shadow-lg shadow-[#E8452C]/30 hover:bg-[#E8452C]/90"
                            >
                                {isSaving && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}

                                {isSaving ? "Saving..." : "Publish menu item"}
                            </Button>

                        </div>
                    </form>

                    {/* RIGHT SIDE: PREVIEW AND CHECKLIST */}

                    <aside className="lg:col-span-5">
                        <div
                            className="rounded-3xl p-5 sm:p-7 lg:sticky lg:top-6"
                            style={{
                                backgroundImage:
                                    "linear-gradient(160deg, rgba(232,69,44,0.14), rgba(47,107,58,0.14))",
                            }}
                        >
                            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-[#1F2A1F]/50">
                                LIVE PREVIEW
                            </p>

                            <PreviewCard
                                preview={preview}
                                name={values.name}
                                category={values.category}
                                price={values.price}
                                location={values.location}
                                description={values.description}
                            />

                            <Checklist items={checklistItems} />
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    )
}
