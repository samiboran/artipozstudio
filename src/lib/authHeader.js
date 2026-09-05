// src/lib/authHeader.js
// Sipariş/talep edge function'larına gönderilen Authorization header'ı
// oluşturur. Önceden her yerde sabit VITE_SUPABASE_ANON_KEY gönderiliyordu
// — bu da edge function'ın "bu isteği kim yaptı" bilgisini hiç bilmemesi
// anlamına geliyordu (misafir/üye ayrımı yoktu). Giriş yapmış bir
// kullanıcının kendi oturum access_token'ı buradan gönderilirse, edge
// function supabase.auth.getUser(token) ile GERÇEK kullanıcıyı sunucu
// tarafında doğrulayıp siparişi o kullanıcıya bağlayabiliyor (bkz.
// Siparişlerim sayfası) — client'ın "ben buyum" diye bir user_id alanı
// göndermesine güvenilmiyor, spoof edilemez.
import { supabase } from './supabase'

export async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY
}
