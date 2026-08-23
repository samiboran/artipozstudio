
import { supabase } from './supabase'

// Standart ISO kağıt boyutlarının mm karşılığı — İşler ürünlerinde
// "A4/A3/A2" etiketinin yanında fiziksel ölçüyü de göstermek için.
export const SIZE_MM = {
  A4: '210 × 297 mm',
  A3: '297 × 420 mm',
  A2: '420 × 594 mm',
}

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
    .select('*, artwork_images(id, image_url, sort_order), artwork_mockups(id, image_url, sort_order)')
    .eq('slug', slug)
    .single()
  if (error) { console.error('Slug hatası:', error.message); return null }
  if (data?.artwork_images) data.artwork_images.sort((a, b) => a.sort_order - b.sort_order)
  if (data?.artwork_mockups) data.artwork_mockups.sort((a, b) => a.sort_order - b.sort_order)
  return data
}