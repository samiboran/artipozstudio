
import { useState } from 'react'

let listeners = []
let cartState = []

function setCart(newCart) {
  cartState = newCart
  listeners.forEach(l => l([...newCart]))
}

export function useCart() {
  const [items, setItems] = useState(cartState)

  if (!listeners.includes(setItems)) {
    listeners.push(setItems)
  }

  function addItem(artwork, size, price) {
    const key = `${artwork.id}-${size}`
    const exists = cartState.find(i => i.key === key)
    if (exists) {
      setCart(cartState.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setCart([...cartState, { key, artwork, size, price, qty: 1 }])
    }
  }

  function removeItem(key) {
    setCart(cartState.filter(i => i.key !== key))
  }

  function updateQty(key, qty) {
    if (qty < 1) { removeItem(key); return }
    setCart(cartState.map(i => i.key === key ? { ...i, qty } : i))
  }

  function clearCart() {
    setCart([])
  }

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return { items, addItem, removeItem, updateQty, clearCart, total, count }
}