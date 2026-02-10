interface SkeletonTextProps {
  lines?: number
  widths?: string[]
}

export default function SkeletonText({ lines = 3, widths }: SkeletonTextProps) {
  const defaultWidths = ['100%', '90%', '75%', '60%', '85%']

  return (
    <div className="space-y-3 animate-pulse-soft">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-gray-200"
          style={{ width: widths?.[i] ?? defaultWidths[i % defaultWidths.length] }}
        />
      ))}
    </div>
  )
}
