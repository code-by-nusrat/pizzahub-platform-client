"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type CartItem = {
  menuId: string
  name: string
  price: number
  image?: string
  businessName?: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  setQuantity: (menuId: string, quantity: number) => void
  removeItem: (menuId: string) => void
  clear: () => void
}

const STORAGE_KEY = "pizzahub-cart"
const MAX_QTY = 20

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load the saved cart once, in the browser
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setItems(parsed)
        }
      } catch {
        // Corrupt or blocked storage: start with an empty cart
      }
      setLoaded(true)
    })
  }, [])

  // Save every change (but never before the saved cart has been loaded)
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or blocked: the cart still works for this visit
    }
  }, [items, loaded])

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuId === item.menuId)
      if (existing) {
        return prev.map((i) =>
          i.menuId === item.menuId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
            : i
        )
      }
      return [...prev, { ...item, quantity: Math.min(MAX_QTY, quantity) }]
    })
  }, [])

  const setQuantity = useCallback((menuId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.menuId === menuId
          ? { ...i, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) }
          : i
      )
    )
  }, [])

  const removeItem = useCallback((menuId: string) => {
    setItems((prev) => prev.filter((i) => i.menuId !== menuId))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, isOpen, openCart, closeCart, addItem, setQuantity, removeItem, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>")
  }
  return context
}
