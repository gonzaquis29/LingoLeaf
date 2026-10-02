import type { SupabaseClient } from '@supabase/supabase-js'

// Id del usuario autenticado para renderizar páginas. getClaims() valida el JWT localmente
// (claves públicas cacheadas) en vez de un viaje a Supabase como getUser(). El proxy ya refresca la
// sesión; las Server Actions de escritura siguen usando getUser() como validación explícita.
export async function getUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getClaims()
  return data?.claims?.sub ?? null
}
