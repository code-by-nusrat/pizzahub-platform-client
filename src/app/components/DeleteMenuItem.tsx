"use client"

import { useState } from "react"
import Image from "next/image"
import { toast } from "react-toastify"
import { Trash2, AlertTriangle, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

import { deleteItem } from "@/lib/vendor-menu-api"

interface DeleteMenuItemProps {
  id: string
  name: string
  category: string
  price: number
  image: string
}

export default function DeleteMenuItem({
  id,
  name,
  category,
  price,
  image,
}: DeleteMenuItemProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)

      await deleteItem(id)

      toast.success("Menu item deleted successfully!")

      setOpen(false)
      router.push("/dashboard/vendor/menu")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete menu item."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8EC] p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="overflow-hidden rounded-2xl border-none shadow-lg">
          <CardHeader className="bg-linear-to-r from-[#E8452C] to-[#F2751A] text-white">
            <div className="flex items-center gap-3">
              <Trash2 className="h-7 w-7" />
              <div>
                <CardTitle className="text-2xl">Delete Menu Item</CardTitle>
                <CardDescription className="text-white/80">
                  Manage your PizzaHub menu
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-5 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
              <Image
                src={image || "/placeholder.png"}
                alt={name}
                width={144}
                height={128}
                sizes="(max-width: 640px) 100vw, 144px"
                className="h-32 w-full rounded-xl object-cover sm:w-36"
              />

              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                <p className="text-sm text-gray-500">Category: {category}</p>
                <p className="text-lg font-extrabold text-[#E8452C]">
                  ৳{Number(price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
              <div>
                <h3 className="font-bold text-red-700">Warning!</h3>
                <p className="mt-1 text-sm text-red-600">
                  Deleting this menu item is permanent. You cannot recover it
                  after deletion.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setOpen(true)}
              disabled={loading}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Menu Item
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to permanently delete &quot;{name}&quot;. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={loading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {loading ? (
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
    </div>
  )
}