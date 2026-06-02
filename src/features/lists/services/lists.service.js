import { supabase } from '@/shared/services/supabaseClient'

export async function fetchLists() {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchListBySlug(slug) {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function checkSlugAvailable(slug) {
  const { data, error } = await supabase
    .from('lists')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data === null
}

export async function createList(payload) {
  // user_id é preenchido automaticamente via DEFAULT auth.uid() no banco
  const { data, error } = await supabase
    .from('lists')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateList(id, payload) {
  const { data, error } = await supabase
    .from('lists')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteList(id) {
  const { error } = await supabase.from('lists').delete().eq('id', id)
  if (error) throw error
}

// Converte File para blob WebP redimensionado (256×256 max)
function resizeToWebPBlob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 256
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('canvas.toBlob retornou null')); return }
          resolve(blob)
        }, 'image/webp', 0.85)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadListLogo(file) {
  const blob = await resizeToWebPBlob(file)
  const filename = `${crypto.randomUUID()}.webp`

  const { error } = await supabase.storage
    .from('list-logos')
    .upload(filename, blob, { contentType: 'image/webp', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('list-logos').getPublicUrl(filename)
  return data.publicUrl
}

// Migra um logo antigo (data URL) para o Storage.
// Chamado de forma lazy quando o usuário abre uma lista com logo legado.
export async function migrateLogoToStorage(listId, dataUrl) {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const filename = `${crypto.randomUUID()}.webp`

  const { error } = await supabase.storage
    .from('list-logos')
    .upload(filename, blob, { contentType: 'image/webp', upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('list-logos').getPublicUrl(filename)
  const publicUrl = data.publicUrl

  await updateList(listId, { logo_url: publicUrl })
  return publicUrl
}
