import { supabaseAdmin } from './admin'

export type MediaTable = 'movies' | 'books' | 'songs'

export function requireMediaTable(value: string | null): MediaTable | null {
  if (value === 'movies' || value === 'books' || value === 'songs') return value
  return null
}

export async function listMedia(table: MediaTable) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data, error } = await supabaseAdmin.from(table).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createMedia(table: MediaTable, payload: Record<string, unknown>) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data, error } = await supabaseAdmin.from(table).insert(payload).select('*').single()
  if (error) throw error
  return data
}

export async function updateMedia(table: MediaTable, id: string, payload: Record<string, unknown>) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data, error } = await supabaseAdmin.from(table).update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function deleteMedia(table: MediaTable, id: string) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
  if (error) throw error
}
