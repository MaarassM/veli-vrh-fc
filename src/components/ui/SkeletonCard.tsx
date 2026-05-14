interface SkeletonCardProps {
  lines?: number
  hasImage?: boolean
}

export default function SkeletonCard({ lines = 3, hasImage = true }: SkeletonCardProps) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse-soft">
      {hasImage && (
        <div className="h-48 bg-gray-200" />
      )}
      <div className="p-5 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-gray-200"
            style={{ width: i === 0 ? '75%' : i === lines - 1 ? '50%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}
