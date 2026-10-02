import { HeaderSkeleton, BannerSkeleton, RowSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function VocabularyLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <BannerSkeleton />
        <div className="mx-auto w-full max-w-[860px] px-8">
          <div className="mb-5 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 36, width: 84, borderRadius: 100 }} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
