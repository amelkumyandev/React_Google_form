import { useEffect } from 'react'
import { clearCache, clearExpired } from './db'
import { useGoogleSearch } from './hooks/useGoogleSearch'
import { SearchBar } from './components/SearchBar'
import { ResultsList } from './components/ResultsList'
import { CacheBadge } from './components/CacheBadge'
import './styles/index.css'

export default function App() {
  const {
    loading,
    error,
    data,
    fromCache,
    search
  } = useGoogleSearch()

  // prune expired cache entries once on mount
  useEffect(() => { void clearExpired() }, [])

  return (
    <main className="mx-auto max-w-2xl p-4">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          Google Books Search 📚
        </h1>
      </header>

      <SearchBar onSearch={search} />

      <div className="mb-4 flex items-center gap-2">
        <CacheBadge fromCache={fromCache} />
        <button
          onClick={() => void clearCache()}
          className="text-xs text-red-600 hover:underline"
        >
          Clear cache
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {data && <ResultsList results={data} />}
    </main>
  )
}
