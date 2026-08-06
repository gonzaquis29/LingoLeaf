import type { SupabaseClient } from '@supabase/supabase-js'

// AC US6.1: cuántas tarjetas de repaso hay pendientes hoy, visible desde cualquier pantalla (Header).
export async function getDueCount(supabase: SupabaseClient, userId: string, language: string): Promise<number> {
  const { count } = await supabase
    .from('vocabulary')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('language', language)
    .lte('due_date', new Date().toISOString())

  return count ?? 0
}
