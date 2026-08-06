import type { ReactNode } from 'react'
import { COLORS, CARD_RADIUS } from '@/lib/theme'

export function AuthCard({
  children,
  step,
  totalSteps,
}: {
  children: ReactNode
  step?: number
  totalSteps?: number
}) {
  return (
    <main
      className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      <div
        className="absolute rounded-full"
        style={{
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          height: 280,
          background: COLORS.mossSoft,
          zIndex: 0,
        }}
      />
      <div
        className="relative z-10 w-[440px] max-w-[92vw]"
        style={{
          background: COLORS.creamCard,
          borderRadius: CARD_RADIUS,
          padding: '40px 36px',
          boxShadow: '0 20px 50px rgba(20,24,28,0.12)',
        }}
      >
        {step !== undefined && totalSteps !== undefined && (
          <div className="mb-6 flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i < step ? COLORS.mossMid : 'rgba(20,24,28,0.12)' }}
              />
            ))}
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
