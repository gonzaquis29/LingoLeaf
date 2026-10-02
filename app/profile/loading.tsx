import { HeaderSkeleton, BannerSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function ProfileLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <BannerSkeleton />
        <div className="mx-auto w-full max-w-[640px] px-8">
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
        </div>
      </main>
    </>
  )
}
