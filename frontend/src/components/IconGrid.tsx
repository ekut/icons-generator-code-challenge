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
    <div className="space-y-6">
      {/* Download All Button */}
      {icons.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={onDownloadAll}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-5 rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm font-semibold active:scale-95 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All ({icons.length})
          </button>
        </div>
      )}

      {/* Icon Grid - Responsive: 1 col on mobile, 2 cols on sm+, 4 cols on xl+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="group bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            {/* Icon Image Container with enhanced styling */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden mb-4 shadow-inner">
              <img
                src={icon.url}
                alt={`Generated icon: ${icon.prompt}`}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </div>

            {/* Icon Metadata with improved typography */}
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-700 font-medium truncate" title={icon.prompt}>
                {icon.prompt}
              </p>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <p className="text-xs text-gray-500 capitalize">
                  Style: {icon.style}
                </p>
              </div>
            </div>

            {/* Enhanced Download Button */}
            <button
              onClick={() => onDownload(icon.id)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-semibold active:scale-95 shadow-md group-hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
