export default function ProgressBar({
  value,
  max,
}: {
  value: number
  max: number
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color =
    pct < 80 ? 'bg-emerald-500' : pct < 100 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="h-2 w-full bg-gray-200 rounded" data-testid="progress-bar-container">
      <div className={`h-2 ${color} rounded`} style={{ width: `${pct}%` }} />
    </div>
  )
}
