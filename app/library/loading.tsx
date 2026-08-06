import { HeaderSkeleton, CardSkeleton, Skeleton } from '@/components/Layout/Skeleton'

// Next muestra esto de inmediato al navegar ("instant loading state") — nada de retrasarlo,
// eso es lo que causaba la pantalla en blanco.
export default function LibraryLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-20 pt-8">
        <Skeleton style={{ height: 26, width: 220, marginBottom: 20 }} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  )
}
