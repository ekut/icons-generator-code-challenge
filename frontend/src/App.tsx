import { useState, useEffect } from 'react'
import type { GeneratedIcon, StylePreset } from './types'
import { PromptInput } from './components/PromptInput'
import { StyleSelector } from './components/StyleSelector'
import { ColorInput, validateHexColor } from './components/ColorInput'
import { LoadingSpinner } from './components/LoadingSpinner'
import { getStyles, generateIcons } from './services/api'
import './App.css'

function App() {
  // State management for the application
  const [prompt, setPrompt] = useState<string>('')
  const [promptError, setPromptError] = useState<string>('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [brandColors, setBrandColors] = useState<string[]>([])
  const [icons, setIcons] = useState<GeneratedIcon[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [styles, setStyles] = useState<StylePreset[]>([])

  // Fetch available styles on component mount
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const fetchedStyles = await getStyles()
        setStyles(fetchedStyles)
      } catch (err) {
        console.error('Failed to fetch styles:', err)
        // Set error but don't block the UI
        setError('Failed to load styles. Please refresh the page.')
      }
    }

    fetchStyles()
  }, [])

  // Handler for prompt changes
  const handlePromptChange = (value: string) => {
    setPrompt(value)
    // Clear error when user starts typing
    if (promptError) {
      setPromptError('')
    }
  }

  // Handler for style selection
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
    // Clear error when user selects a style
    if (error === 'Please select a style') {
      setError(null)
    }
  }

  // Handler for form submission
  const handleGenerate = async () => {
    // Validate prompt - must not be empty
    if (!prompt.trim()) {
      setPromptError('Please enter a prompt')
      return
    }

    // Validate style selection - must be selected
    if (!selectedStyle) {
      setError('Please select a style')
      return
    }

    // Validate brand colors - filter out empty ones and validate HEX format
    const nonEmptyColors = brandColors.filter(color => color.trim().length > 0)
    const invalidColors = nonEmptyColors.filter(color => !validateHexColor(color))
    
    if (invalidColors.length > 0) {
      setError('Please fix invalid brand color formats before generating')
      return
    }

    // Clear any previous errors
    setPromptError('')
    setError(null)
    setLoading(true)

    try {
      // Call API to generate icons with validated inputs
      const generatedIcons = await generateIcons({
        prompt: prompt.trim(),
        styleId: selectedStyle,
        brandColors: nonEmptyColors
      })
      
      setIcons(generatedIcons)
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

                {/* Prompt Input */}
                <PromptInput
                  value={prompt}
                  onChange={handlePromptChange}
                  error={promptError}
                  disabled={loading}
                />

                {/* Style Selector */}
                <StyleSelector
                  styles={styles}
                  selectedStyle={selectedStyle}
                  onSelect={handleStyleSelect}
                  disabled={loading}
                />

                {/* Color Input */}
                <ColorInput
                  colors={brandColors}
                  onChange={setBrandColors}
                  maxColors={3}
                  disabled={loading}
                />

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
                <LoadingSpinner message="Generating your icons..." />
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
