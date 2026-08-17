import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

let listeners = []
let cartState = []

function setCart(newCart) {
  cartState = newCart
  listeners.forEach(l => l([...newCart]))
}

// Sepete ekleme olayını arka planda kaydeder — sepetin kendi çalışmasını
// engellemez, hata olursa sessizce yutulur.
async function logCartEvent(artwork, size, price) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('cart_events').insert({
      session_id: getSessionId(),
      user_id: user?.id || null,
      user_email: user?.email || null,
      artwork_title: artwork?.title || null,
      size,
      price,
      qty: 1,
    })
  } catch {
    // sepet takibi başarısız olsa bile kullanıcı deneyimini etkilemesin
  }
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
    logCartEvent(artwork, size, price)
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
