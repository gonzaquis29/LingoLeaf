import { HeaderSkeleton, BannerSkeleton, Skeleton } from '@/components/Layout/Skeleton'
import { CARD_RADIUS } from '@/lib/theme'

export default function ReviewLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <BannerSkeleton />
        <div className="mx-auto w-full max-w-[860px] px-8">
          <div
            className="mx-auto"
            style={{ maxWidth: 480, background: '#FAFAFB', borderRadius: CARD_RADIUS, padding: '40px 32px', border: '1px solid rgba(20,24,28,0.08)' }}
          >
            <Skeleton style={{ height: 16, width: '90%', marginBottom: 10 }} />
            <Skeleton style={{ height: 16, width: '70%', marginBottom: 24 }} />
            <Skeleton style={{ height: 44, width: '100%', borderRadius: 100 }} />
          </div>
        </div>
      </main>
    </>
  )
}
