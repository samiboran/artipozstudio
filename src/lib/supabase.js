import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Ağ isteği bir sebepten askıda kalırsa (örn. tarayıcı sekmesi arka planda,
// bağlantı koptu) supabase-js'in auth kilidini sonsuza kadar tutmaması için
// her isteğe 15 sn'lik sert bir zaman aşımı ekliyoruz.
function timeoutFetch(input, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: timeoutFetch },
})
