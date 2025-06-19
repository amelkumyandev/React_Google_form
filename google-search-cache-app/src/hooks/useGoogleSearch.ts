import { useCallback, useReducer, useRef } from 'react'
import debounce from 'lodash.debounce'
import { searchBooks } from '../api/googleBooks'
import type { Volume } from '../api/googleBooks'
import {
  getCachedResults,
  setCachedResults
} from '../db/index'

interface State {
  loading: boolean
  error: string | null
  data: Volume[] | null
  fromCache: boolean
}

type Action =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: Volume[]; fromCache: boolean }
  | { type: 'ERROR'; payload: string }

const initialState: State = {
  loading: false,
  error: null,
  data: null,
  fromCache: false
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, loading: true, error: null, fromCache: false }
    case 'SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.payload,
        fromCache: action.fromCache
      }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

/**
 * Hook exposing an imperative `search(query)` API.
 *
 * Usage:
 *   const { state, search } = useGoogleSearch();
 *   <SearchBar onSubmit={search} />
 */
export function useGoogleSearch(ttlPrune = false) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // one AbortController per outstanding network request
  const controllerRef = useRef<AbortController | null>(null)

  /* eslint-disable react-hooks/exhaustive-deps */
  const doSearch = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim()
      if (!query) return

      dispatch({ type: 'START' })

      // 1️⃣ attempt cache hit
      try {
        const cached = await getCachedResults(query)
        if (cached) {
          dispatch({ type: 'SUCCESS', payload: cached as Volume[], fromCache: true })
          return
        }
      } catch (e) {
        // ignore cache errors; fall through to network
        console.warn('Cache lookup failed', e)
      }

      // 2️⃣ hit network
      try {
        controllerRef.current?.abort() // cancel previous
        controllerRef.current = new AbortController()

        const data = await searchBooks(query)
        dispatch({ type: 'SUCCESS', payload: data, fromCache: false })
        void setCachedResults(query, data) // async – fire and forget
      } catch (err) {
        console.error(err)
        const msg =
          err instanceof Error ? err.message : 'Unknown error'
        dispatch({ type: 'ERROR', payload: msg })
      }
    },
    []
  )
  /* eslint-enable react-hooks/exhaustive-deps */

  // Public debounced API (300 ms)
  const search = useRef(
    debounce((q: string) => void doSearch(q), 300)
  ).current

  return { ...state, search }
}
