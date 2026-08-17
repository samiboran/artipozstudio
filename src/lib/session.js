// src/lib/session.js
// Tarayıcıda kalıcı, anonim bir oturum kimliği — sepete eklenen ürünleri ve
// siparişi aynı "session_id" ile eşleştirip "sepete ekledi ama almadı" takibini
// mümkün kılmak için kullanılıyor. Kişisel veri değil, rastgele bir kimlik.

const KEY = 'ap_session_id'

export function getSessionId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
