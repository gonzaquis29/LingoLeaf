import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'

export default async function Home() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  redirect(userId ? '/library' : '/login')
}
