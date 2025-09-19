import { create } from 'zustand'

export const useCart = create((set, get) => ({
  tableId: null,
  items: [], // {product, quantity}
  setTableId: (id) => set({ tableId: id }),
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
  clear: () => set({ items: [] })
}))


