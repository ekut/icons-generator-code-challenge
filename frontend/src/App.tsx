import { useState, useEffect } from 'react'
import type { GeneratedIcon, StylePreset, APIError } from './types'
import { PromptInput } from './components/PromptInput'
import { StyleSelector } from './components/StyleSelector'
import { ColorInput, validateHexColor } from './components/ColorInput'
import { IconGrid } from './components/IconGrid'
import { ErrorDisplay } from './components/ErrorDisplay'
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
  const [error, setError] = useState<string | APIError | null>(null)
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

  // Handler for retrying generation after an error
  const handleRetry = () => {
    // Clear error and retry generation
    setError(null)
    handleGenerate()
  }

  // Handler for dismissing error
  const handleDismissError = () => {
    setError(null)
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
        style: selectedStyle,
        brandColors: nonEmptyColors
      })
      
      setIcons(generatedIcons)
    } catch (err) {
      // Handle APIError or generic errors
      if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
        setError(err as APIError)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handler for downloading individual icon
  const handleDownload = async (iconId: string) => {
    // Find the icon by ID
    const icon = icons.find(i => i.id === iconId)
    if (!icon) {
      console.error('Icon not found:', iconId)
      return
    }

    try {
      // Fetch the image as a blob
      const response = await fetch(icon.url)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      
      // Generate descriptive filename based on prompt and style
      // Format: prompt-style-timestamp.png
      // Sanitize prompt: remove special characters, replace spaces with hyphens, lowercase
      const sanitizedPrompt = icon.prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30) // Limit length
      
      const sanitizedStyle = icon.style.toLowerCase().replace(/\s+/g, '-')
      const timestamp = Date.now()
      const filename = `${sanitizedPrompt}-${sanitizedStyle}-${timestamp}.png`
      
      // Create a temporary download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download icon:', err)
      setError('Failed to download icon. Please try again.')
    }
  }

  // Handler for downloading all icons
  const handleDownloadAll = async () => {
    if (icons.length === 0) {
      console.error('No icons to download')
      return
    }

    try {
      // Download each icon sequentially with a small delay to avoid overwhelming the browser
      for (let i = 0; i < icons.length; i++) {
        const icon = icons[i]
        
        // Fetch the image as a blob
        const response = await fetch(icon.url)
        if (!response.ok) {
          console.error(`Failed to fetch icon ${i + 1}:`, icon.id)
          continue // Skip this icon and continue with others
        }
        
        const blob = await response.blob()
        
        // Generate descriptive filename based on prompt and style
        // Format: prompt-style-index-timestamp.png
        // Sanitize prompt: remove special characters, replace spaces with hyphens, lowercase
        const sanitizedPrompt = icon.prompt
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 30) // Limit length
        
        const sanitizedStyle = icon.style.toLowerCase().replace(/\s+/g, '-')
        const timestamp = Date.now()
        const filename = `${sanitizedPrompt}-${sanitizedStyle}-${i + 1}-${timestamp}.png`
        
        // Create a temporary download link and trigger download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Small delay between downloads to avoid browser blocking
        if (i < icons.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    } catch (err) {
      console.error('Failed to download all icons:', err)
      setError('Failed to download some icons. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Icon Set Generator</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate a consistent set of 4 themed icons using AI
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Create Your Icon Set
                  </h2>

                  {/* Prompt Input */}
                  <div className="mb-6">
                    <PromptInput
                      value={prompt}
                      onChange={handlePromptChange}
                      error={promptError}
                      disabled={loading}
                    />
                  </div>

                  {/* Style Selector */}
                  <div className="mb-6">
                    <StyleSelector
                      styles={styles}
                      selectedStyle={selectedStyle}
                      onSelect={handleStyleSelect}
                      disabled={loading}
                    />
                  </div>

                  {/* Color Input */}
                  <div className="mb-6">
                    <ColorInput
                      colors={brandColors}
                      onChange={setBrandColors}
                      maxColors={3}
                      disabled={loading}
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6">
                      <ErrorDisplay
                        error={error}
                        onRetry={handleRetry}
                        onDismiss={handleDismissError}
                      />
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.98] disabled:active:scale-100"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Icons...
                      </span>
                    ) : (
                      'Generate Icons'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Icon Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Generated Icons
              </h2>

              {/* Icon Grid Component */}
              <IconGrid
                icons={icons}
                loading={loading}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
