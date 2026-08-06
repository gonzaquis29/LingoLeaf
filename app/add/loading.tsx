import { HeaderSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function AddLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-20 pt-8">
        <Skeleton style={{ height: 26, width: 220, marginBottom: 24 }} />
        <div className="mb-6 flex gap-2.5">
          <Skeleton style={{ height: 36, width: 110, borderRadius: 100 }} />
          <Skeleton style={{ height: 36, width: 100, borderRadius: 100 }} />
          <Skeleton style={{ height: 36, width: 130, borderRadius: 100 }} />
        </div>
        <div style={{ maxWidth: 560 }} className="flex flex-col gap-3.5">
          <Skeleton style={{ height: 44, width: '100%', borderRadius: 12 }} />
          <Skeleton style={{ height: 44, width: '100%', borderRadius: 12 }} />
          <Skeleton style={{ height: 200, width: '100%', borderRadius: 12 }} />
        </div>
      </main>
    </>
  )
}
