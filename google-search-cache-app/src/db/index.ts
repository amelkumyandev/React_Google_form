/**
 * IndexedDB wrapper around Dexie
 * --------------------------------
 * Schema
 *   searches:
 *     - id            (autoincrement primary key – internal)
 *     - query         (string, UNIQUE – case‑insensitive search term)
 *     - timestamp     (number, epoch ms when data was written)
 *     - results       (unknown, JSON‑serialisable API payload)
 *
 * The table is keyed *by `query`* so we can `.get(query)` directly.
 */

import Dexie, { type Table } from 'dexie'

// -----------------------------
// Types
// -----------------------------
export interface CachedSearch {
  /** e.g. "react testing library" (stored lower‑cased for case‑insensitive lookups) */
  query: string
  /** epoch milliseconds */
  timestamp: number
  /** raw API payload (Google Books volumes list in our case) */
  results: unknown
}

// -----------------------------
// Dexie database
// -----------------------------
class SearchCacheDB extends Dexie {
  /** table reference with typed records */
  public searches!: Table<CachedSearch, string /* primary key = query */>

  constructor() {
    super('GoogleSearchCacheDB')
    // Dexie stores compound schema as a string
    // `query` is the primary key (unique) so we can read by exact term
    this.version(1).stores({
      searches: '&query, timestamp' // & = primary key
    })
  }
}

export const db = new SearchCacheDB()

// -----------------------------
// Environment‑driven TTL
// -----------------------------
const hours =
  Number(import.meta.env.VITE_CACHE_TTL_HOURS ?? '24') || 24
export const CACHE_TTL_MS = hours * 60 * 60 * 1000

// -----------------------------
// CRUD helpers
// -----------------------------
/**
 * Returns cached results if they exist AND are still fresh.
 * Otherwise returns `null`.
 */
export async function getCachedResults(
  rawQuery: string
): Promise<unknown | null> {
  const query = rawQuery.trim().toLowerCase()
  const entry = await db.searches.get(query)

  if (!entry) return null

  const isFresh = Date.now() - entry.timestamp < CACHE_TTL_MS
  return isFresh ? entry.results : null
}

/**
 * Persists the API payload under the provided query.
 */
export async function setCachedResults(
  rawQuery: string,
  results: unknown
): Promise<void> {
  const query = rawQuery.trim().toLowerCase()
  await db.searches.put({
    query,
    timestamp: Date.now(),
    results
  })
}

/** Manually wipe every record – used by “Clear cache” UI button. */
export async function clearCache(): Promise<void> {
  await db.searches.clear()
}

/** Optional: prune expired entries (can be called on app start / idle). */
export async function clearExpired(): Promise<void> {
  const cutoff = Date.now() - CACHE_TTL_MS
  await db.searches
    .where('timestamp')
    .below(cutoff)
    .delete()
}
