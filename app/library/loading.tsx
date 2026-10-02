import { HeaderSkeleton, BannerSkeleton, CardSkeleton, Skeleton } from '@/components/Layout/Skeleton'

// Next muestra esto de inmediato al navegar ("instant loading state") — nada de retrasarlo,
// eso es lo que causaba la pantalla en blanco.
export default function LibraryLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <BannerSkeleton />
        <div className="px-8">
          <div className="mb-6 flex gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 38, width: 80, borderRadius: 100 }} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
