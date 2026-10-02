import { HeaderSkeleton, BannerSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function AddLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <BannerSkeleton />
        <div className="px-8">
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 80, borderRadius: 28 }} />
            ))}
          </div>
          <div style={{ maxWidth: 560 }} className="flex flex-col gap-3.5">
            <Skeleton style={{ height: 44, width: '100%', borderRadius: 12 }} />
            <Skeleton style={{ height: 44, width: '100%', borderRadius: 12 }} />
            <Skeleton style={{ height: 200, width: '100%', borderRadius: 12 }} />
          </div>
        </div>
      </main>
    </>
  )
}
