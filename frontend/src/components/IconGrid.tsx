import type { GeneratedIcon } from '../types'

export interface IconGridProps {
  icons: GeneratedIcon[];
  loading: boolean;
  onDownload: (iconId: string) => void;
  onDownloadAll: () => void;
}

/**
 * IconGrid component displays generated icons in a grid layout
 * with download functionality for each icon
 */
export function IconGrid({ icons, loading, onDownload, onDownloadAll }: IconGridProps) {
  // Loading state - show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            role="status"
            aria-label="Loading icons"
          >
            <span className="sr-only">Loading</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Generating your icons...
          </p>
        </div>
      </div>
    )
  }

  // Empty state - no icons to display
  if (icons.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-4 text-sm text-gray-600">
          Your generated icons will appear here
        </p>
      </div>
    )
  }

  // Success state - display icons in grid
  return (
    <div>
      {/* Download All Button */}
      {icons.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={onDownloadAll}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Download All ({icons.length})
          </button>
        </div>
      )}

      {/* Icon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Icon Image */}
            <div className="aspect-square bg-white rounded-md overflow-hidden mb-3 flex items-center justify-center">
              <img
                src={icon.url}
                alt={`Generated icon: ${icon.prompt}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Icon Metadata */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 truncate" title={icon.prompt}>
                {icon.prompt}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                Style: {icon.style}
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={() => onDownload(icon.id)}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
