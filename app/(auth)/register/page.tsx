import { AuthCard } from '@/components/Auth/AuthCard'
import { RegisterForm } from '@/components/Auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthCard step={1} totalSteps={3}>
      <RegisterForm />
    </AuthCard>
  )
}
