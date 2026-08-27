import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Favoriler artık sepet gibi üyelik gerektirmiyor (Etsy'deki gibi) —
// giriş yapmamış ziyaretçinin favorileri tarayıcıda (localStorage) tutulur.
// Giriş yapılınca hesaba bağlı favoriler (user_favorites tablosu) devreye
// girer; çıkış yapılınca tekrar tarayıcıdaki favorilere dönülür.
const GUEST_KEY = 'ap_guest_favorites'

function loadGuestFavorites() {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGuestFavorites(ids) {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(ids)) } catch { /* yoksay */ }
}

let listeners = []
let favState = loadGuestFavorites()
let currentUserId = null

function setFavs(newFavs) {
  favState = newFavs
  listeners.forEach(l => l([...newFavs]))
}

async function loadFavorites(userId) {
  if (!userId) { setFavs(loadGuestFavorites()); return }
  const { data, error } = await supabase.from('user_favorites').select('artwork_id').eq('user_id', userId)
  if (error) { console.error('Favoriler yüklenemedi:', error.message); return }
  setFavs((data || []).map(r => r.artwork_id))
}

supabase.auth.getSession().then(({ data: { session } }) => {
  currentUserId = session?.user?.id || null
  if (currentUserId) loadFavorites(currentUserId)
})

// onAuthStateChange içinde senkron supabase çağrısı auth-lock deadlock'una
// yol açtığı için (bu oturumda daha önce tespit edilip Navbar.jsx'te
// düzeltilen bug), yükleme setTimeout ile bir sonraki tick'e erteleniyor.
supabase.auth.onAuthStateChange((_event, session) => {
  const uid = session?.user?.id || null
  if (uid === currentUserId) return
  currentUserId = uid
  setTimeout(() => loadFavorites(uid), 0)
})

export function useFavorites() {
  const [ids, setIds] = useState(favState)

  if (!listeners.includes(setIds)) {
    listeners.push(setIds)
  }

  async function toggle(id) {
    const adding = !favState.includes(id)
    const next = adding ? [...favState, id] : favState.filter(x => x !== id)
    setFavs(next)

    if (currentUserId) {
      const { error } = adding
        ? await supabase.from('user_favorites').insert({ user_id: currentUserId, artwork_id: id })
        : await supabase.from('user_favorites').delete().eq('user_id', currentUserId).eq('artwork_id', id)
      if (error) console.error(adding ? 'Favoriye eklenemedi:' : 'Favoriden çıkarılamadı:', error.message)
    } else {
      saveGuestFavorites(next)
    }

    return true
  }

  function isFav(id) {
    return ids.includes(id)
  }

  return { ids, toggle, isFav, count: ids.length, loggedIn: !!currentUserId }
}
