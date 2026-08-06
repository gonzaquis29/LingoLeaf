import { HeaderSkeleton, Skeleton } from '@/components/Layout/Skeleton'
import { CARD_RADIUS } from '@/lib/theme'

export default function ProfileLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[640px] flex-1 px-8 pb-20 pt-8">
        <Skeleton style={{ height: 26, width: 100, marginBottom: 24 }} />
        <Skeleton style={{ height: 82, width: '100%', borderRadius: CARD_RADIUS, marginBottom: 32 }} />
        <Skeleton style={{ height: 14, width: 110, marginBottom: 12 }} />
        <div className="mb-6 flex flex-wrap gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 36, width: 100, borderRadius: 100 }} />
          ))}
        </div>
        <Skeleton style={{ height: 14, width: 170, marginBottom: 12 }} />
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 36, width: 100, borderRadius: 100 }} />
          ))}
        </div>
      </main>
    </>
  )
}
