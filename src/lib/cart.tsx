
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

export type CheckoutDetails = {
  date: string
  address: string
  note: string
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  isOpen: boolean
  checkoutDetails: CheckoutDetails | null
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  setQuantity: (menuId: string, quantity: number) => void
  removeItem: (menuId: string) => void
  clear: () => void
  setCheckoutDetails: (details: CheckoutDetails) => void
}

const STORAGE_KEY = "pizzahub-cart"
const CHECKOUT_KEY = "pizzahub-checkout"
const MAX_QTY = 20

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutDetails, setCheckoutDetailsState] =
    useState<CheckoutDetails | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load cart and checkout information from localStorage
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedCart = localStorage.getItem(STORAGE_KEY)

        if (savedCart) {
          const parsed = JSON.parse(savedCart)

          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        }

        const savedCheckout = localStorage.getItem(CHECKOUT_KEY)

        if (savedCheckout) {
          const parsed = JSON.parse(savedCheckout)

          if (
            typeof parsed.date === "string" &&
            typeof parsed.address === "string" &&
            typeof parsed.note === "string"
          ) {
            setCheckoutDetailsState(parsed)
          }
        }
      } catch {
        // Start with empty data if storage is unavailable
      }

      setLoaded(true)
    })
  }, [])

  // Save cart changes
  useEffect(() => {
    if (!loaded) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Cart remains available for the current session
    }
  }, [items, loaded])

  const addItem = useCallback<CartContextValue["addItem"]>(
    (item, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.menuId === item.menuId)

        if (existing) {
          return prev.map((i) =>
            i.menuId === item.menuId
              ? {
                  ...i,
                  quantity: Math.min(MAX_QTY, i.quantity + quantity),
                }
              : i
          )
        }

        return [
          ...prev,
          {
            ...item,
            quantity: Math.min(MAX_QTY, quantity),
          },
        ]
      })
    },
    []
  )

  const setQuantity = useCallback(
    (menuId: string, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.menuId === menuId
            ? {
                ...i,
                quantity: Math.max(1, Math.min(MAX_QTY, quantity)),
              }
            : i
        )
      )
    },
    []
  )

  const removeItem = useCallback((menuId: string) => {
    setItems((prev) => prev.filter((i) => i.menuId !== menuId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  // Save delivery date, address and kitchen note
  const setCheckoutDetails = useCallback(
    (details: CheckoutDetails) => {
      setCheckoutDetailsState(details)

      try {
        localStorage.setItem(CHECKOUT_KEY, JSON.stringify(details))
      } catch {
        // Keep the information in React state
      }
    },
    []
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ),
      isOpen,
      checkoutDetails,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
      setCheckoutDetails,
    }),
    [
      items,
      isOpen,
      checkoutDetails,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
      setCheckoutDetails,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>")
  }

  return context
}
