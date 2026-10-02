import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { AuthCard } from '@/components/Auth/AuthCard'
import { GuidedTour } from '@/components/Onboarding/GuidedTour'

export default async function OnboardingTutorialPage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  return (
    <AuthCard step={3} totalSteps={3}>
      <GuidedTour />
    </AuthCard>
  )
}
