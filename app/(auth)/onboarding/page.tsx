import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthCard } from '@/components/Auth/AuthCard'
import { LanguageForm } from '@/components/Onboarding/LanguageForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AuthCard step={2} totalSteps={3}>
      <LanguageForm />
    </AuthCard>
  )
}
