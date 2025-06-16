import { Volume } from '../api/googleBooks'
import { ResultCard } from './ResultCard'

interface Props {
  results: Volume[]
}

export function ResultsList({ results }: Props) {
  if (results.length === 0) {
    return <p>No results.</p>
  }

  return (
    <ul className="space-y-4">
      {results.map(v => (
        <li key={v.id}>
          <ResultCard volume={v} />
        </li>
      ))}
    </ul>
  )
}
