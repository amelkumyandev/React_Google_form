import { FormEvent, useState } from 'react'

interface Props {
  onSearch: (query: string) => void
}

/** Full‑text search box with 300 ms debounce handled in parent hook */
export function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input
        type="search"
        aria-label="Search books"
        placeholder="Search Google Books…"
        className="flex-1 rounded border p-2 shadow-sm"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  )
}
