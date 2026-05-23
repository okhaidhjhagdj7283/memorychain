import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function MemoryCardSkeleton() {
  return (
    <div className="card overflow-hidden p-0">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function FamilyCardSkeleton() {
  return (
    <div className="card p-4 sm:p-5 h-full flex flex-col">
      <div className="h-28 w-full mb-3.5 rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div
        className="pt-2.5 mt-4 flex justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
