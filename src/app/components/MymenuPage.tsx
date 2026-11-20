"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Loader2,
  ImageOff,
} from "lucide-react"
import { toast } from "react-toastify"

import {
  updateItem,
  deleteItem,
  changeAvailability,
  BASE_URL,
  type MenuItem,
} from "@/lib/vendor-menu-api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Navbar from "./Navbar"

// Turns a saved image value into a full URL.
// Full links are used as they are; paths like "/uploads/pizza.jpg" are loaded from your backend.
function resolveImage(src?: string) {
  if (!src) return ""
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src
  return `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`
}

// Item photo with a clean fallback when the image is missing or fails to load
function MenuImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  const url = resolveImage(src)

  if (!url || failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        <ImageOff className="h-5 w-5" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-12 w-12 shrink-0 rounded-lg object-cover"
    />
  )
}

type MyMenuPageProps = {
  initialItems?: MenuItem[]
}

type EditForm = {
  name: string
  price: string
  location: string
  description: string
}

const emptyForm: EditForm = {
  name: "",
  price: "",
  location: "",
  description: "",
}

export default function MyMenuPage({ initialItems }: MyMenuPageProps) {
  const router = useRouter()

  // Items saved without a status or availability get safe defaults
  const [items, setItems] = useState<MenuItem[]>(
    (initialItems ?? []).map((item) => ({
      ...item,
      approvalStatus: item.approvalStatus ?? "pending",
      isAvailable: item.isAvailable ?? false,
    }))
  )
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Edit state
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EditForm>(emptyForm)

  // Search and filter
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === "all" || item.approvalStatus === filter

    return matchesSearch && matchesFilter
  })

  // View item
  function viewItem(item: MenuItem) {
    alert(
      `Name: ${item.name}\n\n` +
        `Category: ${item.category}\n\n` +
        `Description: ${item.description}\n\n` +
        `Price: ৳${item.price}\n\n` +
        `Location: ${item.location}\n\n` +
        `Status: ${item.approvalStatus}`
    )
  }

  // Open edit dialog
  function openEdit(item: MenuItem) {
    setEditing(item)
    setForm({
      name: item.name,
      price: String(item.price),
      location: item.location,
      description: item.description,
    })
  }

  // Save edit
  async function handleUpdate() {
    if (!editing) return

    if (
      form.name.trim().length < 3 ||
      !form.location.trim() ||
      !form.description.trim() ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      toast.error("Please enter valid information.")
      return
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      location: form.location.trim(),
      description: form.description.trim(),
    }

    try {
      setSaving(true)
      await updateItem(editing._id, payload)

      setItems((prev) =>
        prev.map((i) => (i._id === editing._id ? { ...i, ...payload } : i))
      )

      toast.success("Menu item updated!")
      setEditing(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update menu item."
      )
    } finally {
      setSaving(false)
    }
  }

  // Confirm delete
  async function handleDelete() {
    if (!deleteId) return

    try {
      setDeleting(true)
      await deleteItem(deleteId)

      setItems((prev) => prev.filter((i) => i._id !== deleteId))
      toast.success("Menu item deleted successfully!")
      setDeleteId(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete menu item."
      )
    } finally {
      setDeleting(false)
    }
  }

  // Change availability
  async function handleAvailability(item: MenuItem, available: boolean) {
    try {
      await changeAvailability(item._id, available)

      setItems((previous) =>
        previous.map((i) =>
          i._id === item._id ? { ...i, isAvailable: available } : i
        )
      )

      toast.success("Availability updated!")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update availability."
      )
    }
  }

  // Statistics
  const approved = items.filter((i) => i.approvalStatus === "approved").length
  const pending = items.filter((i) => i.approvalStatus === "pending").length
  const rejected = items.filter((i) => i.approvalStatus === "rejected").length

  return (
    <div className="min-h-screen space-y-6 bg-[#FFF8EC] p-4 sm:p-6">
      <Navbar></Navbar>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-linear-to-r from-[#E8452C] to-[#F2751A] p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            My Menu Items 🍕
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Manage your food items and availability.
          </p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/vendor/menu/new")}
          className="bg-white text-[#E8452C] hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { title: "Total Items", value: items.length },
          { title: "Approved", value: approved },
          { title: "Pending", value: pending },
          { title: "Rejected", value: rejected },
        ].map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{stat.title}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#E8452C]">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filter}
          onValueChange={(value) => {
            if (value) setFilter(value)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Menu Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            No menu items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FFF8EC]">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex min-w-48 items-center gap-3">
                        <MenuImage src={item.image} alt={item.name} />
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{item.category}</TableCell>

                    <TableCell className="font-bold text-[#E8452C]">
                      ৳{Number(item.price).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          item.approvalStatus === "approved"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : item.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-700 hover:bg-red-100"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        }
                      >
                        {item.approvalStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        disabled={item.approvalStatus !== "approved"}
                        onCheckedChange={(checked) =>
                          handleAvailability(item, checked)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => viewItem(item)}
                          title="View item"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(item)}
                          title="Edit item"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteId(item._id)}
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !saving) setEditing(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details of your menu item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Item Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (৳)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location (area / city)</Label>
              <Input
                id="edit-location"
                placeholder="Dhanmondi, Dhaka"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleUpdate}
              className="bg-[#E8452C] text-white hover:bg-[#d13c25]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              menu item from your menu.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}