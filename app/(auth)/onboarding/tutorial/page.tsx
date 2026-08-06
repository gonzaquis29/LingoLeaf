import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthCard } from '@/components/Auth/AuthCard'
import { GuidedTour } from '@/components/Onboarding/GuidedTour'

export default async function OnboardingTutorialPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AuthCard step={3} totalSteps={3}>
      <GuidedTour />
    </AuthCard>
  )
}
