import { useState } from 'react'
import type { GeneratedIcon, StylePreset } from './types'
import './App.css'

function App() {
  // State management for the application
  const [prompt, setPrompt] = useState<string>('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [brandColors, setBrandColors] = useState<string[]>([])
  const [icons, setIcons] = useState<GeneratedIcon[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [styles, setStyles] = useState<StylePreset[]>([])

  // Handler for form submission
  const handleGenerate = async () => {
    // Validation
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    if (!selectedStyle) {
      setError('Please select a style')
      return
    }

    setError(null)
    setLoading(true)

    try {
      // TODO: Call API to generate icons (will be implemented in task 6.2)
      console.log('Generating icons with:', { prompt, selectedStyle, brandColors })
      
      // Placeholder for now
      setIcons([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handler for downloading individual icon
  const handleDownload = (iconId: string) => {
    // TODO: Implement download logic (will be implemented in task 9.5)
    console.log('Downloading icon:', iconId)
  }

  // Handler for downloading all icons
  const handleDownloadAll = () => {
    // TODO: Implement download all logic (will be implemented in task 9.8)
    console.log('Downloading all icons')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Icon Set Generator</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate a consistent set of 4 themed icons using AI
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Create Your Icon Set
                </h2>

                {/* Prompt Input - Placeholder */}
                <div className="mb-4">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Theme
                  </label>
                  <input
                    id="prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Toys, Food, Travel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Style Selector - Placeholder */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visual Style
                  </label>
                  <div className="text-sm text-gray-500">
                    Style selector will be implemented in task 7.4
                  </div>
                </div>

                {/* Color Input - Placeholder */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Colors (Optional)
                  </label>
                  <div className="text-sm text-gray-500">
                    Color input will be implemented in task 7.7
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Icons'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Icon Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generated Icons
              </h2>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Generating your icons...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && icons.length === 0 && (
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
              )}

              {/* Icon Grid - Placeholder */}
              {!loading && icons.length > 0 && (
                <div className="text-sm text-gray-500">
                  Icon grid will be implemented in task 9.1
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
