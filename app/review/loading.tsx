import { HeaderSkeleton, Skeleton } from '@/components/Layout/Skeleton'
import { CARD_RADIUS } from '@/lib/theme'

export default function ReviewLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-8 pb-20 pt-10">
        <Skeleton style={{ height: 24, width: 100, margin: '0 auto 32px' }} />
        <div
          className="mx-auto"
          style={{ maxWidth: 480, background: '#FAFAFB', borderRadius: CARD_RADIUS, padding: '40px 32px', border: '1px solid rgba(20,24,28,0.08)' }}
        >
          <Skeleton style={{ height: 16, width: '90%', marginBottom: 10 }} />
          <Skeleton style={{ height: 16, width: '70%', marginBottom: 24 }} />
          <Skeleton style={{ height: 44, width: '100%', borderRadius: 100 }} />
        </div>
      </main>
    </>
  )
}
