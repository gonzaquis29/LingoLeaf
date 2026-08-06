import { HeaderSkeleton, Skeleton } from '@/components/Layout/Skeleton'

export default function ReaderLoading() {
  return (
    <>
      <HeaderSkeleton />
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 gap-10 px-8 pb-20 pt-8">
        <div className="min-w-0 flex-1">
          <Skeleton style={{ height: 22, width: '50%', marginBottom: 8 }} />
          <Skeleton style={{ height: 12, width: 80, marginBottom: 28 }} />
          <Skeleton style={{ height: 56, width: '100%', borderRadius: 16, marginBottom: 14 }} />
          <div style={{ borderRadius: 24, padding: '40px 44px', border: '1px solid rgba(20,24,28,0.08)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 14, width: i % 2 === 0 ? '95%' : '80%', marginBottom: 16 }} />
            ))}
          </div>
        </div>
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <Skeleton style={{ height: 130, width: '100%', borderRadius: 16 }} />
        </aside>
      </main>
    </>
  )
}
