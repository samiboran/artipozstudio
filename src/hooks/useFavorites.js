import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Favoriler artık hesaba bağlı (user_favorites tablosu) — giriş yapmamış
// ziyaretçi favori ekleyemez; toggle() sessizce false döner, çağıran taraf
// (ArtCard/ProductDetail) bunu sadece küçük bir "sallanma" animasyonu için
// kullanır, kalıcı bir değişiklik yapılmaz.
let listeners = []
let favState = []
let currentUserId = null

function setFavs(newFavs) {
  favState = newFavs
  listeners.forEach(l => l([...newFavs]))
}

async function loadFavorites(userId) {
  if (!userId) { setFavs([]); return }
  const { data, error } = await supabase.from('user_favorites').select('artwork_id').eq('user_id', userId)
  if (error) { console.error('Favoriler yüklenemedi:', error.message); return }
  setFavs((data || []).map(r => r.artwork_id))
}

supabase.auth.getSession().then(({ data: { session } }) => {
  currentUserId = session?.user?.id || null
  loadFavorites(currentUserId)
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

  // Dönüş değeri: true = gerçekten değişti, false = giriş yapılmadığı için
  // hiçbir şey yapılmadı (arayüz sadece görsel bir geri bildirim gösterebilir).
  async function toggle(id) {
    if (!currentUserId) return false
    if (favState.includes(id)) {
      setFavs(favState.filter(x => x !== id))
      const { error } = await supabase.from('user_favorites').delete().eq('user_id', currentUserId).eq('artwork_id', id)
      if (error) console.error('Favoriden çıkarılamadı:', error.message)
    } else {
      setFavs([...favState, id])
      const { error } = await supabase.from('user_favorites').insert({ user_id: currentUserId, artwork_id: id })
      if (error) console.error('Favoriye eklenemedi:', error.message)
    }
    return true
  }

  function isFav(id) {
    return ids.includes(id)
  }

  return { ids, toggle, isFav, count: ids.length, loggedIn: !!currentUserId }
}
