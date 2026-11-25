import { supabase, isSupabaseConfigured } from './supabase'
import { createEmptyData, validateImportedData } from './data'

export async function loadRemoteData(userId) {
  if (!userId || !isSupabaseConfigured || !supabase) return null
  try {
    const { data, error } = await supabase
      .from('finora_data')
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      console.warn('Finora: loadRemoteData error', error)
      return null
    }
    if (!data) return null
    const validated = validateImportedData(data.data || {})
    return validated ? { ...createEmptyData(), ...validated } : null
  } catch (e) {
    console.warn('Finora: loadRemoteData failed', e)
    return null
  }
}

export async function saveRemoteData(userId, data) {
  if (!userId || !isSupabaseConfigured || !supabase) return
  try {
    const clean = JSON.parse(JSON.stringify(data))
    const { error } = await supabase
      .from('finora_data')
      .upsert(
        { user_id: userId, data: clean, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
    if (error) console.warn('Finora: saveRemoteData error', error)
  } catch (e) {
    console.warn('Finora: saveRemoteData failed', e)
  }
}
