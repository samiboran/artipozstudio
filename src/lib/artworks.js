
import { supabase } from './supabase'

export async function fetchArtworks({ tag, search } = {}) {
  let query = supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  if (tag) {
    const mainCats = ['fotoğraf', 'resim', 'baskı', 'heykel']
    if (mainCats.includes(tag.toLowerCase())) {
      query = query.ilike('medium', tag)
    } else {
      query = query.contains('tags', [tag])
    }
  }

  const s = (search || '').toLowerCase()
  .replace(/i/g, 'i').replace(/ı/g, 'i')
  .replace(/ğ/g, 'g').replace(/ü/g, 'u')
  .replace(/ş/g, 's').replace(/ö/g, 'o')
  .replace(/ç/g, 'c')
  
if (s) query = query.or(`title.ilike.%${s}%,artist.ilike.%${s}%`)

  const { data, error } = await query
  if (error) { console.error('Fetch hatası:', error.message); return [] }
  return data
}

export async function fetchArtworkBySlug(slug) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error('Slug hatası:', error.message); return null }
  return data
}