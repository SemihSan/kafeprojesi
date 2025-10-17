import { create } from 'zustand'

// Get initial tableId from localStorage
const getInitialTableId = () => {
  try {
    return localStorage.getItem('cafe-tableId') || null
  } catch {
    return null
  }
}

export const useCart = create((set, get) => ({
  tableId: getInitialTableId(),
  items: [], // {product, quantity}
  setTableId: (id) => {
    set({ tableId: id })
    try {
      if (id) {
        localStorage.setItem('cafe-tableId', id)
      } else {
        localStorage.removeItem('cafe-tableId')
      }
    } catch {
      // Ignore localStorage errors
    }
  },
  addItem: (product) => {
    const exists = get().items.find((i) => i.product.id === product.id)
    if (exists) {
      set({ items: get().items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) })
    } else {
      set({ items: [...get().items, { product, quantity: 1 }] })
    }
  },
  removeItem: (productId) => set({ items: get().items.filter(i => i.product.id !== productId) }),
  changeQty: (productId, qty) => set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, qty) } : i) }),
  clear: () => {
    set({ items: [] })
    // Don't clear tableId when clearing cart items - user might want to order again from same table
  }
}))


