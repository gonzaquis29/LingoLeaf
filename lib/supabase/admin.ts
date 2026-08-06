import { createClient } from '@supabase/supabase-js'

// Cliente con permisos de servicio (bypassa RLS) — solo se importa desde código de servidor
// (Route Handlers, Server Actions). SUPABASE_SERVICE_ROLE_KEY no lleva prefijo NEXT_PUBLIC_,
// así que nunca llega al bundle del navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
