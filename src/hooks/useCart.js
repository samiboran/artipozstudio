import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

let listeners = []
let cartState = []
let currentUserId = null

function setCart(newCart) {
  cartState = newCart
  listeners.forEach(l => l([...newCart]))
}

supabase.auth.getSession().then(({ data: { session } }) => { currentUserId = session?.user?.id || null })
// setTimeout: onAuthStateChange callback'i içinde senkron supabase çağrısı
// auth-lock deadlock'una yol açıyor (bu oturumda tespit edilip düzeltilen bug).
// CartSidebar App.jsx'te sayfa değişse de hep aynı örnekte kaldığı için,
// currentUserId güncellendikten sonra listeners'ı da tetikleyip (loggedIn'i
// okuyan bileşenlerin) yeniden render olmasını sağlıyoruz.
supabase.auth.onAuthStateChange((_event, session) => {
  setTimeout(() => {
    currentUserId = session?.user?.id || null
    listeners.forEach(l => l([...cartState]))
  }, 0)
})

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

  // Dönüş değeri: true = gerçekten eklendi, false = giriş yapılmadığı için
  // hiçbir şey yapılmadı (arayüz sadece görsel bir geri bildirim gösterebilir).
  function addItem(artwork, size, price) {
    if (!currentUserId) return false
    const key = `${artwork.id}-${size}`
    const exists = cartState.find(i => i.key === key)
    if (exists) {
      setCart(cartState.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setCart([...cartState, { key, artwork, size, price, qty: 1 }])
    }
    logCartEvent(artwork, size, price)
    return true
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

  return { items, addItem, removeItem, updateQty, clearCart, total, count, loggedIn: !!currentUserId }
}
