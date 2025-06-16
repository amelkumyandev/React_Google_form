/**
 * Thin wrapper around the Google Books Volumes REST endpoint.
 * Docs → https://developers.google.com/books/docs/v1/using
 */
import axios from 'axios'

/** Subset of the Google Books volume resource we care about */
export interface Volume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    imageLinks?: { thumbnail?: string }
    description?: string
    publishedDate?: string
    infoLink?: string
  }
}

/**
 * Query the Google Books API.
 *
 * @param query – full‑text search string
 * @returns array of Volume objects (empty array if no items)
 * @throws network / HTTP errors bubble up to caller
 */
export async function searchBooks(query: string): Promise<Volume[]> {
  const key = import.meta.env.VITE_GOOGLE_API_KEY
  if (!key) {
    throw new Error('Missing VITE_GOOGLE_API_KEY')
  }

  const url = 'https://www.googleapis.com/books/v1/volumes'
  const res = await axios.get(url, {
    params: { q: query, key }
  })

  // API returns { items?: [...] }
  return res.data.items ?? []
}
