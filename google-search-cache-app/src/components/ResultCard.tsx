import { type Volume } from '../api/googleBooks'

export function ResultCard({ volume }: { volume: Volume }) {
  const info = volume.volumeInfo
  return (
    <article className="flex gap-4 rounded border p-4 shadow-sm">
      {info.imageLinks?.thumbnail && (
        <img
          src={info.imageLinks.thumbnail}
          alt={`Cover of ${info.title}`}
          className="h-24 w-16 object-cover"
          loading="lazy"
        />
      )}

      <div className="flex-1">
        <h3 className="text-lg font-semibold">
          {info.title}
        </h3>
        {info.authors && (
          <p className="text-sm text-gray-700">
            {info.authors.join(', ')}
          </p>
        )}
        {info.publishedDate && (
          <p className="text-xs text-gray-500">
            Published {info.publishedDate}
          </p>
        )}
        {info.infoLink && (
          <a
            href={info.infoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            More info
          </a>
        )}
      </div>
    </article>
  )
}