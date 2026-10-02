import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { AuthCard } from '@/components/Auth/AuthCard'
import { LanguageForm } from '@/components/Onboarding/LanguageForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  return (
    <AuthCard step={2} totalSteps={3}>
      <LanguageForm />
    </AuthCard>
  )
}
