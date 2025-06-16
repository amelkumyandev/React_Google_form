interface Props { fromCache: boolean }

export function CacheBadge({ fromCache }: Props) {
  if (!fromCache) return null
  return (
    <span
      title="Results loaded from local cache"
      className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
    >
      from cache
    </span>
  )
}
