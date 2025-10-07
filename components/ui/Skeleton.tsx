/**
 * Skeleton Component
 * Provides loading placeholders for better perceived performance
 */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-surface-light'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

/**
 * Skeleton presets for common use cases
 */

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <div className="space-y-2">
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton height={16} width="80%" />
      </div>
    </div>
  )
}

export function SkeletonTracker() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton height={20} width={120} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <div className="space-y-3">
        <Skeleton height={48} />
        <Skeleton height={48} />
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <Skeleton height={24} width={180} className="mb-4" />
      <Skeleton height={300} />
    </div>
  )
}

export function SkeletonScorecard() {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <Skeleton height={24} width={200} className="mb-6" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 91 }).map((_, i) => (
          <Skeleton key={i} height={40} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-6 space-y-2">
          <Skeleton height={16} width={100} />
          <Skeleton height={36} width={80} />
          <Skeleton height={12} width={120} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton height={36} width={300} className="mb-2" />
        <Skeleton height={20} width={400} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonTracker />
          <SkeletonTracker />
          <SkeletonTracker />
        </div>
        <div className="lg:col-span-1">
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
