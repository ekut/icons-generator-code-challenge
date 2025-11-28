export interface LoadingSpinnerProps {
  message?: string;
}

/**
 * LoadingSpinner component displays an animated loading indicator
 * with an optional progress message
 */
export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        {/* Animated spinner */}
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading</span>
        </div>
        
        {/* Progress message */}
        {message && (
          <p className="mt-4 text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
