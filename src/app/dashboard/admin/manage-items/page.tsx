
"use client"

import { toast } from "react-toastify"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    Search,
    RefreshCw,
    Pizza,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Power,
    Loader2,
    UtensilsCrossed,
    Filter,
} from "lucide-react"
import "react-toastify/dist/ReactToastify.css"
import { BASE_URL } from "@/lib/vendor-menu-api"
import { clientFetch } from "@/lib/client-api"

type ApprovalStatus = "pending" | "approved" | "rejected"

type MenuItem = {
    _id: string
    name: string
    category: string
    description: string
    price: number
    businessName: string
    vendorEmail: string
    location: string
    image: string
    approvalStatus: ApprovalStatus
    isAvailable: boolean
    createdAt?: string
}

const API_URL = BASE_URL

const statusStyles: Record<ApprovalStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
}

function confirmWithToast(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        const toastId = toast(
            <div className="space-y-3">
                <p className="font-semibold text-slate-800">{message}</p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(toastId)
                            resolve(false)
                        }}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            toast.dismiss(toastId)
                            resolve(true)
                        }}
                        className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white"
                    >
                        Confirm
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            }
        )
    })
}

export default function ManageItemsPage() {
    const [items, setItems] = useState<MenuItem[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [availabilityFilter, setAvailabilityFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

    // Fetch all menu items
    const fetchItems = useCallback(async () => {
        if (!API_URL) {
            setError("NEXT_PUBLIC_API_URL is not configured.")
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await clientFetch(
                `${API_URL}/menu?approvalStatus=all`
            )

            if (!response.ok) {
                throw new Error("Could not load menu items.")
            }

            const data = await response.json()

            if (!Array.isArray(data)) {
                throw new Error(data.message || "Invalid menu response.")
            }

            setItems(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        queueMicrotask(() => {
            void fetchItems()
        })
    }, [fetchItems])

    // Search and filter
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const searchText = search.toLowerCase().trim()

            const matchesSearch =
                !searchText ||
                item.name?.toLowerCase().includes(searchText) ||
                item.businessName?.toLowerCase().includes(searchText) ||
                item.category?.toLowerCase().includes(searchText) ||
                item.vendorEmail?.toLowerCase().includes(searchText)

            const matchesStatus =
                statusFilter === "all" ||
                item.approvalStatus === statusFilter

            const matchesAvailability =
                availabilityFilter === "all" ||
                (availabilityFilter === "active" && item.isAvailable) ||
                (availabilityFilter === "inactive" && !item.isAvailable)

            return matchesSearch && matchesStatus && matchesAvailability
        })
    }, [items, search, statusFilter, availabilityFilter])

    // Statistics
    const pendingCount = items.filter(
        (item) => item.approvalStatus === "pending"
    ).length

    const approvedCount = items.filter(
        (item) => item.approvalStatus === "approved"
    ).length

    const activeCount = items.filter(
        (item) =>
            item.approvalStatus === "approved" && item.isAvailable
    ).length

    // Update approval status. The backend only accepts "approved" or
    // "pending": unpublishing an item means moving it back to pending.
   
// Update approval status

const updateApproval = async (
    id: string,
    approvalStatus: "approved" | "pending"
) => {
    const action =
        approvalStatus === "approved"
            ? "approve"
            : "hide from customers"

    if (
        !(await confirmWithToast(
            `Are you sure you want to ${action} this item?`
        ))
    ) {
        return
    }

    try {
        setBusyId(id)

        const response = await clientFetch(
            `${API_URL}/menu/${id}/moderation`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ approvalStatus }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
                data.message || `Could not ${action} item.`
            )
        }

        // Update the item using the actual backend response
        setItems((previous) =>
            previous.map((item) =>
                item._id === id
                    ? {
                          ...item,
                          approvalStatus: data.approvalStatus,
                          isAvailable: data.isAvailable,
                      }
                    : item
            )
        )

        // Show warning if approved but not active
        if (
            data.approvalStatus === "approved" &&
            data.isAvailable === false
        ) {
            toast.warning(
                data.message ||
                    `Item approved, but the vendor has reached the ${data.limit}-item limit.`,
                { autoClose: 6000 }
            )
        } else {
            toast.success(data.message || "Item updated successfully!")
        }
    } catch (err) {
        toast.error(
            err instanceof Error
                ? err.message
                : "Something went wrong."
        )
    } finally {
        setBusyId(null)
    }
}



    // Activate or deactivate an approved item
    const updateAvailability = async (item: MenuItem) => {
        const nextAvailability = !item.isAvailable

        if (
            !(await confirmWithToast(
                `Are you sure you want to ${
                    nextAvailability ? "activate" : "deactivate"
                } ${item.name}?`
            ))
        ) {
            return
        }

        try {
            setBusyId(item._id)

            const response = await clientFetch(
                `${API_URL}/menu/${item._id}/availability`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isAvailable: nextAvailability,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not update availability."
                )
            }

            setItems((previous) =>
                previous.map((current) =>
                    current._id === item._id
                        ? {
                              ...current,
                              isAvailable: nextAvailability,
                          }
                        : current
                )
            )

            toast.success(
                `${item.name} ${
                    nextAvailability ? "activated" : "deactivated"
                } successfully!`
            )
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            )
        } finally {
            setBusyId(null)
        }
    }

    // Format date
    const formatDate = (date?: string) => {
        if (!date) return "—"

        const parsed = new Date(date)

        if (Number.isNaN(parsed.getTime())) return "—"

        return parsed.toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    return (
        <main className="min-h-screen bg-[#FFF8EC] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* Heading */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-600">
                            <UtensilsCrossed size={17} />
                            PizzaHub Administration
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Manage Menu Items
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Review submissions, manage approvals, and control published dishes.
                        </p>
                    </div>

                    <button
                        onClick={fetchItems}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        label="Total submissions"
                        value={items.length}
                        icon={<Pizza size={20} />}
                        color="bg-orange-50 text-orange-600"
                    />

                    <StatCard
                        label="Pending review"
                        value={pendingCount}
                        icon={<Clock size={20} />}
                        color="bg-amber-50 text-amber-600"
                    />

                    <StatCard
                        label="Approved items"
                        value={approvedCount}
                        icon={<CheckCircle2 size={20} />}
                        color="bg-emerald-50 text-emerald-600"
                    />

                    <StatCard
                        label="Active on menu"
                        value={activeCount}
                        icon={<Power size={20} />}
                        color="bg-blue-50 text-blue-600"
                    />
                </div>

                {/* Search and filters */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Filter size={17} />
                        Search and filter
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search item, business, category..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                        >
                            <option value="all">All approval statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            value={availabilityFilter}
                            onChange={(event) =>
                                setAvailabilityFilter(event.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                        >
                            <option value="all">All availability</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </section>

                {/* Menu items */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Submitted items
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Showing {filteredItems.length} of {items.length} items
                                {" · "}
                                {pendingCount} pending review
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2
                                size={30}
                                className="animate-spin text-orange-500"
                            />
                            <p className="text-sm">
                                Loading menu items...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
                            <XCircle size={32} className="text-red-500" />

                            <p className="text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                onClick={fetchItems}
                                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                Try again
                            </button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
                            <Pizza size={38} className="text-slate-300" />

                            <h3 className="font-semibold text-slate-700">
                                No menu items found
                            </h3>

                            <p className="text-sm text-slate-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredItems.map((item) => {
                                const isBusy = busyId === item._id

                                return (
                                    <article
                                        key={item._id}
                                        className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 sm:p-5 lg:flex-row lg:items-center"
                                    >
                                        {/* Image and item information */}
                                        <div className="flex min-w-0 flex-1 gap-4">
                                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-300">
                                                        <Pizza size={30} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-slate-900">
                                                        {item.name}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                                                            statusStyles[item.approvalStatus] ||
                                                            "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {item.approvalStatus}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {item.category} · {item.location}
                                                </p>

                                                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                    {item.description}
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    <span>
                                                        Business:{" "}
                                                        <strong className="text-slate-700">
                                                            {item.businessName}
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        {formatDate(item.createdAt)}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="font-bold text-orange-600">
                                                        ৳{Number(item.price).toLocaleString("en-BD")}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                            item.isAvailable
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                        }`}
                                                    >
                                                        {item.isAvailable ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                            <button
                                                onClick={() =>
                                                    setSelectedItem(item)
                                                }
                                                title="View details"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                            >
                                                <Eye size={15} />
                                                View
                                            </button>

                                            {item.approvalStatus === "pending" && (
                                                <button
                                                    onClick={() =>
                                                        updateApproval(item._id, "approved")
                                                    }
                                                    disabled={isBusy}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {isBusy ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={14} />
                                                    )}
                                                    Approve
                                                </button>
                                            )}

                                            {item.approvalStatus === "approved" && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            updateAvailability(item)
                                                        }
                                                        disabled={isBusy}
                                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                                            item.isAvailable
                                                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                    >
                                                        {isBusy ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Power size={14} />
                                                        )}

                                                        {item.isAvailable
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            updateApproval(item._id, "pending")
                                                        }
                                                        disabled={isBusy}
                                                        title="Hide from customers"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        <XCircle size={14} />
                                                        Hide
                                                    </button>
                                                </>
                                            )}

                                            {item.approvalStatus === "rejected" && (
                                                <button
                                                    onClick={() =>
                                                        updateApproval(item._id, "approved")
                                                    }
                                                    disabled={isBusy}
                                                    title="Approve this item again"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                    {isBusy ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={14} />
                                                    )}
                                                    Approve again
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Item details modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Menu item details
                            </h2>

                            <button
                                onClick={() => setSelectedItem(null)}
                                className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        <img
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            className="mb-4 h-52 w-full rounded-xl bg-slate-100 object-cover"
                        />

                        <h3 className="text-xl font-bold text-slate-900">
                            {selectedItem.name}
                        </h3>

                        <p className="mt-1 font-semibold text-orange-600">
                            ৳{Number(selectedItem.price).toLocaleString("en-BD")}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            {selectedItem.description}
                        </p>

                        <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                            <p>
                                <strong>Category:</strong> {selectedItem.category}
                            </p>
                            <p>
                                <strong>Business:</strong> {selectedItem.businessName}
                            </p>
                            <p>
                                <strong>Vendor:</strong> {selectedItem.vendorEmail}
                            </p>
                            <p>
                                <strong>Location:</strong> {selectedItem.location}
                            </p>
                            <p>
                                <strong>Approval:</strong> {selectedItem.approvalStatus}
                            </p>
                            <p>
                                <strong>Availability:</strong>{" "}
                                {selectedItem.isAvailable ? "Active" : "Inactive"}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedItem(null)}
                            className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string
    value: number
    icon: React.ReactNode
    color: string
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    {label}
                </p>

                <div className={`rounded-xl p-2 ${color}`}>
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {value}
            </p>
        </div>
    )
}
