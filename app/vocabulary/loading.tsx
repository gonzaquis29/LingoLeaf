import { HeaderSkeleton, RowSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function VocabularyLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-8 pb-20 pt-8">
        <Skeleton style={{ height: 26, width: 180, marginBottom: 24 }} />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  )
}
